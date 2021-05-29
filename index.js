const { Command } = require('commander');
const axios = require('axios');
const admin = require('firebase-admin');
const { App, ExpressReceiver } = require("@slack/bolt");
const { SFRepo } = require('./handoff/sf-services')

const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
//const express = require('express')
const dotenv = require("dotenv")
dotenv.config()
const port = 3005

const { helloView } = require('./views/hello')
const { hView } = require('./views/h')

let options = _getOptions();
console.log(`OPTIONS: ${_js(options)}`)
let firebaseServiceAccount
if(options.environment === 'dev') {
    try {
        firebaseServiceAccount = require('./.fb-keys.json')
    } catch(error) {
        console.log(`Error getting firebase service account...`)
    }
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount)
});
const db = admin.firestore();
console.log(`Firebase initialised...`)


const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    //receiver
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/echo", async ({ command, ack, say }) => {
    try {
        await ack();
        say(`${command.text}`);
    } catch (error) {
        console.error(error);
    }
});

app.command("/hellomodal", async ({ ack, body, client }) => {
    try {
        console.log(JSON.stringify(helloView))
        await ack();
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: helloView
        });
        console.log(result);
    }
    catch (error) {
        console.error(error);
    }
});

app.command("/h", async ({ ack, body, client }) => {
    try {
        //console.log(JSON.stringify(hView))
        await ack();
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: hView
        });
        console.log(result);
    }
    catch (error) {
        console.error(error);
    }
});

app.command("/btc", async ({ command, ack, say }) => {
    try {
        await ack();
        let resp = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
        btcVal = resp.data.bpi.USD
        say(`BTC price in USD: $${btcVal.rate}`);
    } catch (error) {
        console.log("err")
        console.error(error);
    }
});

app.view('h_view', async ({ack, body, view, client, say}) => {
    try {
        //console.log(`h_view submission called...`)
        await ack();

        //console.log(_js(view))
        const user = body['user']['id'];
        const mobilePhone = body['view']['state']['values']['blockid-mobile']['mobile-input-action']['value'];
        const email = body['view']['state']['values']['blockid-email']['email-input-action']['value'];
        const firstName = body['view']['state']['values']['blockid-fname']['fname-input-action']['value'];
        const lastName = 'unknownatexampledotcom';
        const leadSource = 'Manual';
        const lead_Sub_Source__c = 'Livechat';

        const leadToCreate = {mobilePhone, email, firstName, leadSource, lead_Sub_Source__c, lastName}
        console.log(`Will create: ${_js(leadToCreate)}`)
        console.log(_js(body))
        const sfRepo = new SFRepo();
        await sfRepo.createLead(leadToCreate);

        await client.chat.postMessage({
            channel: user,
            text: `Thank you!`
        });
    } catch(err) {
        console.error(err)
    }
})

app.view('hello_view', async ({ack, body, view, client, say}) => {
    try {

        await ack();
        console.log(JSON.stringify(view))
        const user = body['user']['id'];
        console.log(JSON.stringify(body))
        const val = view['state']['values']['input_c']['dreamy_input']['value'];
        await client.chat.postMessage({
            channel: user,
            text: `Thank you!`,
            text: val
        });
    } catch(err) {
        console.error(err)
    }
})

app.action('button_abc', async (context) => {
    // Acknowledge the action
    try{
        await context.ack();
        await app.client.chat.postMessage({ // Can't use 'say' or 'respond' for button clicks from modals?
            token: context.context.botToken,
            channel: context.body.user.id,
            text: 'Thanks!'
        })
    } catch(error) {
        console.error(error)
    }
});


app.message('wt', async ({ message, say }) => {
    const data = {
        name: 'Sanjay',
        weight: 74
    };
    console.log(`Full message: ${message.text}`)

// Add a new document in collection "cities" with ID 'LA'
    const res = await db.collection('health_test').add(data);
    console.log(`Quote should have been added: ${res.id}`)
});

app.message('knock knock', async ({ message, say }) => {
    await say(`_Who's there?_`);
    const data = {
        name: 'Sanjay',
        age: 18,
        quote: 'Of all sad things of mouth and pen...'
    };

// Add a new document in collection "cities" with ID 'LA'
    const res = await db.collection('people').doc('sanjay').set(data);
    console.log(`Quote should have been added: ${res}`)
});

app.event('app_mention', async ({ event, client, say }) => {
    try {
        say(`Hello 👋. How can I help?`);
    }
    catch (error) {
        console.error(error);
    }


});


(async () => {
    await app.start(process.env.PORT || port);
    console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();


function _js(jsonData) {
    return JSON.stringify(jsonData, null, 4);
}

function _getOptions() {
    const program = new Command();
    program.option('-e, --environment <environment>', 'Environment [dev | prod]', 'dev')
    program.parse(process.argv);

    return program.opts();
}

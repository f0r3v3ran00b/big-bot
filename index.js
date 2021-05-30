const { Command } = require('commander');
const axios = require('axios');
const admin = require('firebase-admin');
const { App, ExpressReceiver } = require("@slack/bolt");
const { SFRepo } = require('./handoff/sf-services')
const applicationProperties =require('./application-properties')

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
(async () => {
    await app.start(process.env.PORT || port);
    console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();


///////////////////    START SF INTEGRATION            //////////////////////////////////////////
app.command("/h", async ({ ack, body, client }) => {
    try {
        //console.log(JSON.stringify(hView))
        await ack();
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: hView
        });
        //console.log(result);
    }
    catch (error) {
        console.error(error);
    }
});

app.view('h_view', async ({ack, body, view, client, say}) => {
    try {
        await ack();

        const userWhoSubmittedForm = body['user']['id'];

        const userInfo = await client.users.info({user: userWhoSubmittedForm})
        const userEmail = userInfo.user.profile.email;
        console.log(`User with email: ${userEmail} submitted the handoff form...`)
        const advisorsTaggedIds = _getAdvisorsTagged(body);
        const taggedAdvisorInfo = await client.users.info({user: advisorsTaggedIds[0]})
        const taggedAdvisorEmail = taggedAdvisorInfo.user.profile.email;

        const leadToCreate = _getLeadDetailsFromBody(body);

        console.log(_js(body))
        const sfRepo = new SFRepo();
        let leadId = await sfRepo.createLead(leadToCreate);
        let user = await sfRepo.getSFUserFromEmail(taggedAdvisorEmail);
        console.log(`Found user with id: ${user.Id}`)

        const taskToCreate = _getTaskDetailsFromBody(leadId, user.Id, body);
        let taskId = await sfRepo.createTask(taskToCreate);
        console.log(`Task created: ${taskId}`)

        //console.log(`user info: ${_js(userInfo)}`)
        await client.chat.postMessage({
            channel: `${applicationProperties.slackChannelForCreateLeadReplies}`,
            link_names: 1,
            text: `<@${advisorsTaggedIds[0]}>, you have been tagged :tada: A lead with id: ${leadId} has been created!`
        });

        await client.chat.postMessage({
            channel: `${advisorsTaggedIds[0]}`,
            link_names: 1,
            text: `
            # Notification:
            <@${advisorsTaggedIds[0]}>, A handball has been assigned to you :tada: Please view <https://open--uat1.lightning.force.com/lightning/r/User/${taskId}/view|*here*>
            `
        });

        await client.chat.postMessage({
            channel: `${userWhoSubmittedForm}`,
            link_names: 1,
            text: `<@${userWhoSubmittedForm}>, A handball call has been created following your request <https://open--uat1.lightning.force.com/lightning/r/User/${taskId}/view|*here*> :tada: Please note that if the student chooses to continue the conversation on chat, you'll need to log the chat conversation in Salesforce in order for the handball callback task to be cancelled.`
        });
    } catch(err) {
        console.error(err)
    }
})

//////////////////////    END SF INTEGRATION           ///////////////////////////////













////////////// My Experiments //////////////////////////////////////////////////////////

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

app.view('hello_view', async ({ack, body, view, client, say}) => {
    try {

        await ack();
        console.log(JSON.stringify(view))
        const user = body['user']['id'];
        console.log(JSON.stringify(body))
        const val = view['state']['values']['input_c']['dreamy_input']['value'];
        await client.chat.postMessage({
            channel: user,
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*"
                    }
                }
            ]
        });
    } catch(err) {
        console.error(err)
    }
})

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




///////////// PRIVATE UTIL METHODS /////////////////////////////////////

function _js(jsonData) {
    return JSON.stringify(jsonData, null, 4);
}

function _getOptions() {
    const program = new Command();
    program.option('-e, --environment <environment>', 'Environment [dev | prod]', 'dev')
    program.parse(process.argv);

    return program.opts();
}

function _getLeadDetailsFromBody(body) {

    const mobilePhone = body['view']['state']['values']['blockid-mobile']['mobile-input-action']['value'];
    const email = body['view']['state']['values']['blockid-email']['email-input-action']['value'];
    const firstName = body['view']['state']['values']['blockid-fname']['fname-input-action']['value'];
    const lastName = 'unknownatexampledotcom';
    const leadSource = 'Manual';
    const lead_Sub_Source__c = 'Livechat';

    return {mobilePhone, email, firstName, leadSource, lead_Sub_Source__c, lastName}

}

function _getUserInfoForPersonWhoInvokedTheSlashCommand(body) {
    const userId = body['user']['id'];
}

function _getAdvisorsTagged(body) {
    return body['view']['state']['values']['blockid-users']['users-select-action']['selected_users'];
}

function _getTaskDetailsFromBody(leadId, advisorToAssignTo, body) {
    const date = body['view']['state']['values']['blockid-date']['date-action']['selected_date'];
    const time = body['view']['state']['values']['blockid-time']['time-action']['selected_time'];
    let sfDateTime = _getSFDateTimeFromIncoming(date, time);

    let taskToCreate = {
        WhoId: leadId,
        subject: `LiveChat HandBall`,
        Category__c: `Call Back`,
        Sub_Category__c: `Call Back Arranged`,
        OwnerId: advisorToAssignTo,
        Description: `Test Notes`,
        Call_Back_Later_Date_Time__c: sfDateTime?sfDateTime:null
    }

    return taskToCreate;

}

function _getSFDateTimeFromIncoming(date, time) {
    if(!date || !time) return null
    console.log(`Returning datetime: ${`${date}T${time}:00+10:00`}`)
    return `${date}T${time}:00+10:00`
}

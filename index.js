const axios = require('axios');
const { App, ExpressReceiver } = require("@slack/bolt");
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
const dotenv = require("dotenv")
const { helloView } = require('./views/hello')

const admin = require('firebase-admin');

const firebaseServiceAccount = JSON.parse(process.env.FIREBASE_SVC_ACCOUNT)

//const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount)
});

const db = admin.firestore();
console.log(`Firebase initialised...`)

dotenv.config()

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    //signingSecret: process.env.SLACK_SIGNING_SECRET,
    receiver
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
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: body.trigger_id,
            // View payload
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
            text: `Thank you!`,
            text: val
        });
    } catch(err) {
        console.error(err)
    }
})

app.action('button_abc', async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
    console.log(`body: \n${JSON.stringify(body)}`)
    await say(`<@${body.user.id}> clicked the button`);
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

receiver.router.post('/secret-page', (req, res) => {
    let resp = {"greeting": `Yay!`}
    res.send(resp);
});

receiver.router.get('/', (req, res) => {
    let resp = {"greeting": `Welcome to the Big Bot home page!`}
    res.send(resp);
});


(async () => {
    const port = 3005

    await app.start(process.env.PORT || port);
    console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
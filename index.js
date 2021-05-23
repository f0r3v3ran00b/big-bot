const axios = require('axios');
const { App, ExpressReceiver } = require("@slack/bolt");
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
const dotenv = require("dotenv")

dotenv.config()

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    //signingSecret: process.env.SLACK_SIGNING_SECRET,
    receiver
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


app.message('knock knock', async ({ message, say }) => {
    await say(`_Who's there?_`);
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

(async () => {
    const port = 3005

    await app.start(process.env.PORT || port);
    console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
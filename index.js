const axios = require('axios');
const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
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


app.event('app_mention', async ({ event, client }) => {
    try {
        // Call chat.postMessage with the built-in client
        const result = await client.chat.postMessage({
            channel: welcomeChannelId,
            text: `Welcome to the team, <@${event.user.id}>! 🎉 You can introduce yourself in this channel.`
        });
        console.log(result);
    }
    catch (error) {
        console.error(error);
    }
    /*
    try {
        say(`Hello, <@${event.user.id}>! 👋. How can I help?`);
    }
    catch (error) {
        console.error(error);
    }
    */

});

(async () => {
    const port = 3005

    await app.start(process.env.PORT || port);
    console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
const { Command } = require('commander');
const axios = require('axios');
const admin = require('firebase-admin');
const { App, ExpressReceiver } = require("@slack/bolt");
const { SFRepo } = require('./handoff/sf-repo')
const { HandOffService } = require('./handoff/handoff-service')
const applicationProperties =require('./application-properties')
const winston = require('winston')
const { combine, timestamp, label, prettyPrint } = winston.format;
const faker = require('faker')
const { helloView } = require('./views/hello')
const { hView } = require('./views/h')


const logger = winston.createLogger({
    level: 'info',
    format: combine(
                timestamp(),
                prettyPrint(),
                winston.format.colorize()
            ),
    defaultMeta: { service: 'bot-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({level: 'verbose', format: winston.format.simple()})
    ],
})


const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
//const express = require('express')
const dotenv = require("dotenv")
dotenv.config()
const port = 3005


let options = _getOptions();
logger.info(`OPTIONS: ${_js(options)}`)
let firebaseServiceAccount
if(options.environment === 'dev') {
    try {
        firebaseServiceAccount = require('./.fb-keys.json')
    } catch(error) {
        logger.info(`Error getting firebase service account...`)
    }
}

admin.initializeApp({ credential: admin.credential.cert(firebaseServiceAccount) });
const db = admin.firestore();
logger.info(`Firebase initialised...`)


const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    //receiver
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
    await app.start(process.env.PORT || port);
    logger.info(`?????? Slack Bolt app is running on port ${port}!`);
    logger.info(`?????? Slack Bolt app is running on port ${port}!`);
})();


///////////////////    START SF INTEGRATION            //////////////////////////////////////////
app.command("/h", async ({ ack, body, client }) => {
    try {
        await ack();
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: hView
        });
    }
    catch (error) {
        console.error(error);
    }
});

app.view('h_view', async ({ack, body, view, client, say}) => {
    try {
        await ack();
        const sfRepo = new SFRepo();
        const handOffService = new HandOffService();

        let handOffModel = await transformIncomingRequestToHandOffModel(client, body);
        //let emailOfAdvisorToAssignTaskTo = await handOffService.getAdvisorToAssignTaskTo(client, handOffModel);
        //let user = await sfRepo.getSFUserFromEmail(emailOfAdvisorToAssignTaskTo);
        let advisorSFUserId = await handOffService.getAdvisorToAssignTaskTo(client, handOffModel);

        let leadId = await handOffService.createLeadIfNoCurrentMatchingLeadsFound(handOffModel.leadDetails);
        //logger.info(`Found user with id: ${user.Id}`)

        const taskToCreate = _getTaskDetailsFromBody(leadId, advisorSFUserId, body);
        let createdTaskId = await handOffService.assignTaskToAdvisor(taskToCreate)
        //let taskId = await sfRepo.createTask(taskToCreate);
        logger.info(`Task created: ${createdTaskId}`)

        // Send out notifications now
        let notificationsData = { client: client, handOffInitiatorId: handOffModel.handOffInitiator.id, assignedAdvisorId: handOffModel.advisorsTaggedIds[0], leadId: leadId, taskId: createdTaskId };
        await handOffService.sendNotifications(notificationsData);
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
        logger.info(JSON.stringify(helloView))
        await ack();
        const result = await client.views.open({
            trigger_id: body.trigger_id,
            view: helloView
        });
        logger.info(result);
    }
    catch (error) {
        console.error(error);
    }
});

app.view('hello_view', async ({ack, body, view, client, say}) => {
    try {

        await ack();
        logger.info(JSON.stringify(view))
        const user = body['user']['id'];
        logger.info(JSON.stringify(body))
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
        logger.info("err")
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
    logger.info(`Full message: ${message.text}`)

// Add a new document in collection "cities" with ID 'LA'
    const res = await db.collection('health_test').add(data);
    logger.info(`Quote should have been added: ${res.id}`)
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
    logger.info(`Quote should have been added: ${res}`)
});

app.event('app_mention', async ({ event, client, say }) => {
    try {
        say(`Hello ????. How can I help?`);
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
    logger.info(`Returning datetime: ${`${date}T${time}:00+10:00`}`)
    return `${date}T${time}:00+10:00`
}

async function transformIncomingRequestToHandOffModel(client, body) {
    let handOffModel = {};

    const handOffInitiatorInfo = await client.users.info({user: body['user']['id']})
    logger.info(`Handoff initiator info: ${_js(handOffInitiatorInfo)}`)
    handOffModel['handOffInitiator'] = handOffInitiatorInfo.user;
    handOffModel['advisorsTaggedIds'] = body['view']['state']['values']['blockid-users']['users-select-action']['selected_users'];
    handOffModel['leadDetails'] = {
        mobilePhone : body['view']['state']['values']['blockid-mobile']['mobile-input-action']['value'],
        email : body['view']['state']['values']['blockid-email']['email-input-action']['value'],
        firstName : body['view']['state']['values']['blockid-fname']['fname-input-action']['value'],
        lastName : `${faker.name.lastName()}`,
        leadSource : 'Manual',
        lead_Sub_Source__c : 'Livechat'
    }

    return handOffModel;
}

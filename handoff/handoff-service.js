const applicationProperties =require('../application-properties')
const { SFRepo } = require('../handoff/sf-repo')

class HandOffService {

    constructor() {
        this.sfRepo = new SFRepo();
    }

    async getAdvisorToAssignTaskTo(client, handOffModel) {
        let advisorsTaggedIds = handOffModel.advisorsTaggedIds;
        if(advisorsTaggedIds.length > 0) {
            const taggedAdvisorInfo = await client.users.info({user: advisorsTaggedIds[0]})
            const taggedAdvisorEmail = taggedAdvisorInfo.user.profile.email;
            return taggedAdvisorEmail;
        }
    }

    async assignTaskToAdvisor(task, lead, user, handOffModel) {
        let createdTaskid = await this.sfRepo.createTask(task);
        return createdTaskid;
    }

    async sendNotifications({client, handOffInitiatorId, assignedAdvisorId, leadId, taskId}) {
        console.log(`WILL SEND NOTIFICATIONS TO:
                    channel: ${applicationProperties.slackChannelForCreateLeadReplies}
                    assignedAdvisorId: ${assignedAdvisorId}
                    handOffInitiatorId: ${handOffInitiatorId}
                    `)
        // This notification may not be needed...
        await client.chat.postMessage({
            channel: `${applicationProperties.slackChannelForCreateLeadReplies}`,
            link_names: 1,
            text: `<@${assignedAdvisorId}>, you have been tagged :tada: A lead with id: ${leadId} has been created!`
        });

        // Notify advisor to whom a task has been assigned
        await client.chat.postMessage({
            channel: `${assignedAdvisorId}`,
            link_names: 1,
            text: `
            # Notification:
            <@${assignedAdvisorId}>, A handball has been assigned to you :tada: Please view <https://open--uat1.lightning.force.com/lightning/r/User/${taskId}/view|*here*>
            `
        });

        // Notify the chat advisor who created the handball
        await client.chat.postMessage({
            channel: `${handOffInitiatorId}`,
            link_names: 1,
            text: `<@${handOffInitiatorId}>, A handball call has been created following your request <https://open--uat1.lightning.force.com/lightning/r/User/${taskId}/view|*here*> :tada: Please note that if the student chooses to continue the conversation on chat, you'll need to log the chat conversation in Salesforce in order for the handball callback task to be cancelled.`
        });
        console.log(`Notifications sent...`)
    }
}

exports.HandOffService = HandOffService
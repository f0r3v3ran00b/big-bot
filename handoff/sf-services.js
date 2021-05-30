const jsforce = require('jsforce');

class SFRepo {

    constructor() {
        this.sfUsername = process.env.SF_USERNAME;
        this.sfPassword = process.env.SF_PASSWORD;

        this.conn = new jsforce.Connection({
            loginUrl : 'https://test.salesforce.com'
        });

    }

    async login() {
        let userInfo = await this.conn.login(this.sfUsername, this.sfPassword);
        console.log(`Logged in to SF...`)
    }

    async createLead(lead) {
        try {
            await this.login();
            let createLeadResult = await this.conn.sobject("Lead").create(lead);
            console.log("Created lead with record id : " + createLeadResult.id);
            return createLeadResult.id
        } catch(error) {
            console.log(`Lead creation error: ${error}`);
        }
    }

    async createLeadIfNoCurrentMatching(lead) {
        try {
            await this.login();
            let records = [];
            records = await this.conn.sobject("Lead")
                .find(
                    {
                        firstName: lead.firstName,
                        mobilePhone: lead.mobilePhone,
                        email: lead.email
                    }, ['Id', 'firstName', 'mobilePhone', 'email'])
                .execute();
            console.log(`current leads found: ${JSON.stringify(records)}`)
            // Return early
            if(records.length > 0) {
                console.log(`Returning the id of first matching lead: ${records[0].Id}`)
                return records[0].Id
            } else {
                let createLeadResult = await this.conn.sobject("Lead").create(lead);
                console.log("Created lead with record id : " + createLeadResult.id);
                return createLeadResult.id
            }

        } catch(error) {
            console.log(`Lead creation error: ${error}`);
        }
    }

    async createTask(task) {
        try {
            await this.login();
            console.log(`Going to create task: ${JSON.stringify(task)}`)
            let createTaskResult = await this.conn.sobject("Task").create(task);
            console.log("Created task with record id : " + createTaskResult.id);
            return createTaskResult.id
        } catch(error) {
            console.log(`Task creation error: ${error}`);
        }
    }

    async getSFUserFromEmail(email) {
        try {
            await this.login();
            console.log(`Searching for user by email: ${email}`)
            //let user = await this.conn.query(`SELECT Id, username FROM User where email in ['${email}']`);
            let users = await this.conn.sobject('User')
                .find({
                    email: email
                }, ['Id, username']);
            console.log(`User is: ${JSON.stringify(users[0])}`);

            return users[0];
        } catch(error) {
            console.log(`User query error: ${error}`);
        }
    }
}

exports.SFRepo = SFRepo
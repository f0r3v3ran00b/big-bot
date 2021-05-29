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
}

exports.SFRepo = SFRepo
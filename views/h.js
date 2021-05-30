const faker = require('faker')
exports.hView = {
    type: 'modal',
    // View identifier
    callback_id: 'h_view',
    title: {
        type: 'plain_text',
        text: 'Handoff Bot!'
    },
    blocks: [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "This is a header block",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "input",
            "block_id": 'blockid-mobile',
            "element": {
                "type": "plain_text_input",
                "action_id": "mobile-input-action",
                "initial_value": "0123456789"
            },
            "label": {
                "type": "plain_text",
                "text": "Mobile Number",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": 'blockid-email',
            "element": {
                "type": "plain_text_input",
                "action_id": "email-input-action",
                "initial_value": `${faker.internet.email()}`
            },
            "label": {
                "type": "plain_text",
                "text": "Email",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": 'blockid-fname',
            "element": {
                "type": "plain_text_input",
                "action_id": "fname-input-action",
                "initial_value": `${faker.name.findName()}`
            },
            "label": {
                "type": "plain_text",
                "text": "First Name",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": 'blockid-notes',
            "optional": true,
            "element": {
                "type": "plain_text_input",
                "multiline": true,
                "action_id": "notes-input-action",
                "initial_value": `${faker.lorem.paragraph()}`
            },
            "label": {
                "type": "plain_text",
                "text": "Notes",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": 'blockid-date',
            "optional": true,
            "element": {
                "type": "datepicker",
                "initial_date": "2021-08-15",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date",
                    "emoji": true
                },
                "action_id": "date-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Date",
                "emoji": true
            }
        },
        {
            "type": "input",
            "optional": true,
            "block_id": "blockid-time",
            "element": {
                "type": "timepicker",
                "initial_time": "17:00",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a time",
                    "emoji": true
                },
                "action_id": "time-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Time",
                "emoji": true
            }
        },
        {
            "type": "input",
            "optional": true,
            "block_id": 'blockid-users',
            "element": {
                "type": "multi_users_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select users",
                    "emoji": true
                },
                "action_id": "users-select-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Users",
                "emoji": true
            }
        }
    ],
    submit: {
        type: 'plain_text',
        text: 'Submit'
    }
}
exports.hView = {
    type: 'modal',
    // View identifier
    callback_id: 'hello_view',
    title: {
        type: 'plain_text',
        text: 'Handoff Bot!'
    },
    /*blocks: [
        {
            type: 'input',
            block_id: 'mobile_block_id',
            label: {
                type: 'plain_text',
                text: 'Mobile Number'
            },
            element: {
                type: 'plain_text_input',
                action_id: 'mobile_input',
                multiline: false
            }
        },
        {
            type: 'input',
            block_id: 'mobile_block_id',
            label: {
                type: 'plain_text',
                text: 'Mobile Number'
            },
            element: {
                type: 'plain_text_input',
                action_id: 'mobile_input',
                multiline: false
            }
        },
        {
            type: 'input',
            block_id: 'mobile_block_id',
            label: {
                type: 'plain_text',
                text: 'Mobile Number'
            },
            element: {
                type: 'plain_text_input',
                action_id: 'mobile_input',
                multiline: false
            }
        },
        {
            type: 'input',
            block_id: 'mobile_block_id',
            label: {
                type: 'plain_text',
                text: 'Mobile Number'
            },
            element: {
                type: 'plain_text_input',
                action_id: 'mobile_input',
                multiline: false
            }
        }

    ],*/
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
            "element": {
                "type": "plain_text_input",
                "action_id": "mobile-input-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Mobile Number",
                "emoji": true
            }
        },
        {
            "type": "input",
            "element": {
                "type": "plain_text_input",
                "action_id": "email-input-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Email",
                "emoji": true
            }
        },
        {
            "type": "input",
            "element": {
                "type": "plain_text_input",
                "action_id": "fname-input-action"
            },
            "label": {
                "type": "plain_text",
                "text": "First Name",
                "emoji": true
            }
        },
        {
            "type": "input",
            "element": {
                "type": "plain_text_input",
                "multiline": true,
                "action_id": "notes-input-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Notes",
                "emoji": true
            }
        },
        {
            "type": "input",
            "element": {
                "type": "datepicker",
                "initial_date": "1990-04-28",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date",
                    "emoji": true
                },
                "action_id": "datepicker-action"
            },
            "label": {
                "type": "plain_text",
                "text": "Date",
                "emoji": true
            }
        },
        {
            "type": "input",
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
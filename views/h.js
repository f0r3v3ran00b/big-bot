exports.hView = {
    type: 'modal',
    // View identifier
    callback_id: 'hView',
    title: {
        type: 'plain_text',
        text: 'Welcome to the handoff bot!'
    },
    blocks: [
        {
            type: 'input',
            block_id: 'inputMobileNumber',
            label: {
                type: 'plain_text',
                text: 'Mobile Number'
            },
            element: {
                type: 'plain_text_input',
                action_id: 'mobileNumberInput',
                multiline: false
            }
        }
    ],
    submit: {
        type: 'plain_text',
        text: 'Submit'
    }
}
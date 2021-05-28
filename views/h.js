exports.hView = {
    type: 'modal',
    // View identifier
    callback_id: 'hello_view',
    title: {
        type: 'plain_text',
        text: 'Handoff Bot!'
    },
    blocks: [
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
    ],
    submit: {
        type: 'plain_text',
        text: 'Submit'
    }
}
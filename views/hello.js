exports.helloView = {

    type: 'modal',
    // View identifier
    callback_id: 'hello_view_1',
    title: {
        type: 'plain_text',
        text: 'Modal title'
    },
    blocks: [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Welcome to a modal with _blocks_'
            },
            accessory: {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Click me!'
                },
                action_id: 'button_abc'
            }
        }
    ],
    cancel: {
        type: 'plain_text',
        text: 'Cancel'
    }

}
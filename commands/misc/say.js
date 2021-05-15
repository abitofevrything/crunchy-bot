const Commando = require('discord.js-commando');

const { client } = require('../../index.js');

const group = require('./index.js');

module.exports = class ChooseCommand extends Commando.Command {

    constructor() {
        super(client, {
            name: 'say',
            memberName: 'say',
            description: "Make the bot say something",
            aliases: [],
            group: group.id,

            args: [{
                key: 'message',
                prompt: "the message to send",
                type: 'string'
            }]
        });
    }

    run(msg, { message }) {
        msg.say(message);
    }

}
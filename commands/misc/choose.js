const Commando = require('discord.js-commando');

const { client } = require('../../index.js');

const group = require('./index.js');

module.exports = class ChooseCommand extends Commando.Command {

    constructor() {
        super(client, {
            name: 'choose',
            memberName: 'choose',
            description: "Choose from a set of options",
            aliases: ['tirajosaure', 'oneof'],
            group: group.id,

            args: [{
                key: 'options',
                prompt: "The options to choose from",
                type: 'string',
                infinite: true
            }]
        });
    }

    run(msg, { options }) {
        msg.say(options[Math.floor(Math.random() * options.length)]);
    }

}
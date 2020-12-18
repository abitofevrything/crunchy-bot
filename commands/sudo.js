const {commands} = require('../index.js');
const {prefix} = require('../config');

module.exports = {
    name: "sudo",
    aliases: ["runas"],
    help : {
        desc : 'Executes a command as a user',
        syntax : 'sudo (@user) (command)',
        perms : 'MANAGE_GUILD (admin)'
    },
    onexecute: (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')){
            message.channel.send('Insufficient permissions!');
            return;
        }

        let sudoMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (sudoMember == undefined) {
            message.channel.send("Unable to find user " + args[0]);
            return;
        }

        if (sudoMember.roles.size != 0 ? (message.member.roles.size != 0 ? message.member.roles.highest.comparePositionTo(sudoMember.roles.highest) <= 0 : false) : true) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        let sudoCommand = args[1].substring(1);
        let sudoArgs = args.slice(2); 
        /* Create a fake message  and copy over all relevant values*/
        let sudoMsg = {};

        for (let proprety in message) {
            sudoMsg[proprety] = message[proprety];
        }

        /* Overwrite the relevant fields (ones that change per user and per message) */

        sudoMsg.author = sudoMember.user;
        sudoMsg.member = sudoMember;
        sudoMsg.content = prefix + sudoCommand + sudoArgs.join(' ');
        sudoMsg.mentions = message.mentions;

        sudoMsg.awaitReactions = message.awaitReactions;
        sudoMsg.createReactionCollector = message.createReactionCollector;
        sudoMsg.crosspost = message.crosspost;
        sudoMsg.delete = () => {
            message.channel.send('[LOG] -> Deleted SUDO message (no real effect)');
        }
        sudoMsg.edit = () => {
            message.channel.send('[LOG] -> Edited SUDO message (no real effect)')
        }
        sudoMsg.equals = message.equals;
        sudoMsg.fetch = message.fetch;
        sudoMsg.fetchWebhook = message.fetchWebhook;
        sudoMsg.pin = message.pin;
        sudoMsg.react = message.react;
        sudoMsg.reply = message.reply;
        sudoMsg.suppressEmbeds = () => {
            message.channel.send('[LOG] -> Removed Embeds from SUDO message (no real effect)');
        }
        sudoMsg.toString = () => {
            return prefix + sudoCommand + ' ' + sudoArgs.join(' ');
        }
        sudoMsg.unpin = message.unpin;

        for (let command of commands()) {
            if (command.name == sudoCommand || (command.aliases ? command.aliases.includes(sudoCommand) : false)) {
                try {
                    command.onexecute(sudoMsg, sudoArgs);
                    return;
                } catch (e) {
                    if (message.author.id == 506759329068613643) {
                        message.channel.send('Error while processing that command: \n```' + e + "\n```");
                    } else {
                        message.channel.send(`@${message.author.toString()}, there was an internal error while processing that command.`);
                    }
                    console.error(e);
                }
            }
        }
    }
}
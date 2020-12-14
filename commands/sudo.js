const {commands} = require('../index.js');

module.exports = {
    name: "sudo",
    aliases: ["runas"],
    onexecute: (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')){
            message.channel.send('Insufficient permissions!');
            return;
        }

        let sudoMember = message.guild.members.cache.find(member => member.toString() == args[0]);
        if (sudoMember == undefined) {
            message.channel.send("Unable to find user [test]" + args[0]);
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
        sudoMsg.content = require('../config.js').prefix + sudoCommand + sudoArgs.join(' ');
        sudoMsg.mentions = message.mentions;

        for (let command of commands()) {
            if (command.name == sudoCommand || command.aliases.includes(sudoCommand)) {
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
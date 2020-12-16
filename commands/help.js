const { MessageEmbed } = require("discord.js");
const { commands } = require('../index.js');
const { prefix } = require('../config.js');

module.exports = {
    name: "help",
    aliases: ["hlep"],
    help :{
        desc : 'Summons this help menu, or the help for a specific command\n\nSyntax symbols:\n`[param]` -> optional\n`[param[param1]]` -> both optional, can only use `param1` if `param` is present\n`(param)` -> required parameter\n`(param|param1)` one of `param` or `param1`\n`...` -> repeat previous options an infinite amount of times',
        syntax : 'help [command]'
    },
    onexecute : (message, args) => {
        if (args.length == 0) {
            let embed = new MessageEmbed().setTitle('Help');
            embed.addField('Commands', '```' + commands().reduce((acc, curr, index, arr) => acc + (prefix + curr.name) + (index == arr.length - 1 ? '' : '\n'), '') + '```');
            message.channel.send(embed);
        } else {
            let command = commands().filter(command => command.name == args[0] || prefix + command.name == args[0])[0];
            if (command == undefined) {
                message.channel.send('Unable to find command ' + args[0]);
                return;
            }
            let embed = new MessageEmbed().setTitle('Help for ' + command.name);
            embed.addField('Description', command.help.desc);
            embed.addField('Syntax', '`' + prefix + command.help.syntax + '`');
            if (command.help.perms) {
                embed.addField('Required permissions', command.help.perms);
            }
            message.channel.send(embed);
        }
    }
}
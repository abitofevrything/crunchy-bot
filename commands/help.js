const { MessageEmbed } = require("discord.js");
let commands = undefined;
const { prefix } = require('../config.js');

for (let file of fs.readdirSync('../commands').filter(f => f.endsWith('.js')).filter(f => f != 'help.js')) {
	const command = require(file);
	commands.set(command.name, command);
}

module.exports = {
    name: "help",
    aliases: ["hlep"],
    help :{
        desc : 'Summons the help menu.',
        syntax : 'help [command]'
    },
    apiSyntax: [{
        type : 3,
        name : 'command',
        description : 'The command you want help with'
    }],
    onexecute : (message, args) => {
        if (args.length == 0) {
            let embed = new MessageEmbed().setTitle('Help');
            embed.addField('Commands', '```' + commands.array().reduce((acc, curr, index, arr) => acc + (prefix + curr.name) + (index == arr.length - 1 ? '' : '\n'), '') + '```');
            message.channel.send(embed);
        } else {
            let command = commands.find(command => command.name == args[0] || prefix + command.name == args[0]);
            if (command == undefined) {
                message.channel.send('Unable to find command ' + args[0]);
                return;
            }
            let embed = new MessageEmbed().setTitle('Help for ' + command.name);
            embed.addField('Description', command.name == "help" ? 'Summons this help menu, or the help for a specific command\n\nSyntax symbols:\n`[param]` -> optional\n`[param[param1]]` -> both optional, can only use `param1` if `param` is present\n`(param)` -> required parameter\n`(param|param1)` one of `param` or `param1`\n`...` -> repeat previous options an infinite amount of times': command.help.desc);
            embed.addField('Syntax', '`' + prefix + command.help.syntax + '`');
            if (command.help.perms) {
                embed.addField('Required permissions', command.help.perms);
            }
            message.channel.send(embed);
        }
    }
}

commands.set('help', module.exports);
const { MessageEmbed } = require("discord.js");

module.exports = {
    name : 'eval',
    aliases : ['ev'],
    help : {
        desc : 'Evaluates a javascript expression',
        syntax : 'eval (expression)',
        perms : 'MANAGE_GUILD (admin)'
    },
    apiSyntax : [
        {
            type : 3,
            name : 'code',
            description : 'The code to evaluate',
            required : true
        }
    ],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        let result;
        let consoleOutput = [];
        try {
            result = eval("(function() {let console_adapted = {log: (s) => {consoleOutput.push(s);}};" + args.join(' ').replace('```js', '').replace('```', '').replace('console', 'console_adapted') + "})();");
        } catch (e) {
            result = e;
        }

        let embed = new MessageEmbed().setTitle('Eval result').addField('Result: ', '```\n' + result + '\n```');

        if (consoleOutput.length != 0) {
            embed.addField('Console output: ', '```\n' + consoleOutput.join('\n') + '\n```')
        }

        message.channel.send(embed);
    }
}
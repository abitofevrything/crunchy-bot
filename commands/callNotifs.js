const { data } = require('../index.js');

module.exports = {
    name : "callNotifs",
    help : {
        desc : "Enables or disables the automatic calling function",
        syntax : 'autoCall (true|false)',
        perms: 'MANAGE_GUILD (admin)'
    },
    onexecute : (message, args, guild, client) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        if (args.length < 1 || (args[0] != 'false' && args[0] != 'true')) return message.channel.send('Invalid option. Valid options are `true` and `false`');
		
		data.merge(guild.id, {
			callNotifs : args[0] == 'true'
		});

		message.channel.send('Calls will now ' + (args[0] == "true" ? "notify online members." : "no longer notify online members."));
    },
}
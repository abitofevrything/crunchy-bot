const index = require('../index.js');

module.exports = {
    name : 'reload',
    help : {
        desc: 'Reloads the bot',
        syntax : 'reload',
        perms : 'MANAGE_GUILD (admin)'
    },
    aliases : ['rl'],
    apiSyntax : [],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        index.reload();

        message.channel.send('Reload complete!');
    }
}
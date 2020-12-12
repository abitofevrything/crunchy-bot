const index = require('../index.js');

module.exports = {
    name : 'reload',
    aliases : ['rl'],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        index.reload();

        message.channel.send('Reload complete!');
    }
}
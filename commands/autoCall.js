const {setAutoCall} = require('../index.js');
module.exports = {
    name : "autoCall",
    help : {
        desc : "Enables or disables the automatic calling function",
        syntax : 'autoCall (true|false)',
        perms: 'MANAGE_GUILD (admin)'
    },
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }
        setAutoCall(args[0]);
        message.channel.send('Set autoCall status to ' + args[0]);
    }
}
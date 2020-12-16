const {setAutoCall} = require('../index.js');

module.exports = {
    name : "autoCall",
    aliases : [],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }
        setAutoCall(args[0]);
        message.channel.send('Set autoCall status to ' + args[0]);
    }
}
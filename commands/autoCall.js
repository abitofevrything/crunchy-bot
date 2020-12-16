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
    }
}
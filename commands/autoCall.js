const {setAutoCall} = require('../index.js');
module.exports = {
    name : "autoCall",
    help : {
        desc : "Enables or disables the automatic calling function",
        syntax : 'autoCall (true|false)',
        perms: 'MANAGE_GUILD (admin)'
    },
    apiSyntax : [{
        type : 3,
        name : 'state',
        description : 'Whever to enable or disable the autoCall functionality',
        required : true,
        choices : [
            {
                name : 'on',
                value : 'on'
            },
            {
                name : 'off',
                value : 'off'
            }
        ]
    }],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }
        setAutoCall(args[0]);
        message.channel.send('Set autoCall status to ' + args[0]);
    }
}
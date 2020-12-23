const { client } = require('../index.js');

module.exports = {
    name : 'nick',
    aliases : ['n'],
    help : {
        desc : 'Sets the nickname of a user',
        syntax : 'nick (user) (nickname)',
        perms : 'MANAGE_MEMBERS'
    },
    apiSyntax : [
        {
            type : 6,
            name : 'user',
            description : 'The user to set the nickname of',
            required : true
        },{
            type : 3,
            name : 'nickname',
            description : 'The nickname of the user. If left black, will restore original name'
        }
    ],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_MEMBERS')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        let nick = args.splice(1).join(" ");

        if (message.mentions.everyone) {
            message.guild.members.cache.forEach(m => {
                if (m.manageable) {
                    if (m.user.id == client().user.id && nick == '') {
                        message.guild.members.cache.get(client.user.id).setNickname(`Crunchy Bot ${process.env.HEROKU_RELEASE_VERSION || ''}`);
                    } else {
                        m.setNickname(nick);
                    }
                }
            });
            return;
        }
        
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!target) {
            message.channel.send('Cannot fid user ' + args[0]);
            return;
        }

        if (target.manageable || target.user.id == client().user.id) {
            if (target.user.id == client().user.id && nick == '') {
            message.guild.members.cache.get(client.user.id).setNickname(`Crunchy Bot ${process.env.HEROKU_RELEASE_VERSION || ''}`);
            } else {
                target.setNickname(nick);
            }
        } else {
            message.channel.send('Cannot edit ' + target.toString() + "'s name!");
        }
    }

}
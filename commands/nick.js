const { client } = require('../index.js');

module.exports = {
    name : 'nick',
    aliases : ['n'],
    help : {
        desc : 'Sets the nickname of a user',
        syntax : 'nick (user) (nickname)',
        perms : 'MANAGE_MEMBERS'
    },
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_MEMBERS')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        let nick = args.splice(1).join(" ");

        if (message.mentions.everyone) {
            message.guild.members.cache.forEach(m => {
                if (m.manageable) {
                    if (target.user.id == client().user.id && nick == '') {
                    message.guild.members.cache.get(client.user.id).setNickname(`Crunchy Bot ${process.env.HEROKU_RELEASE_VERSION || ''}`);
                    } else {
                        target.setNickname(nick);
                    }
                }
            });
            return;
        }

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
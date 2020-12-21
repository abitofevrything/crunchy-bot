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

        if (target.manageable || target.user.id == client().user.id) {
            let nick = args.splice(1).join(" ");
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
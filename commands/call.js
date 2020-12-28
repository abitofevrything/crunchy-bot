module.exports = {
    name : 'call',
    aliases : ['chat', 'talk', 'scream'],
    help : {
        desc: 'Manual command to start a call',
        syntax : 'call [user [user2 ...]]'
    },
    apiSyntax : [
        {
            type : 6,
            name : 'user',
            description : 'The user to call'
        }
    ],
    onexecute : (message, args) => {
        if (args.length == 0) {
            let voiceStatus;
            if ((voiceStatus = message.member.voice).channel != undefined) {
                message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join ' + voiceStatus.channel.name + ' to chat with them');
            } else {
                message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join a vc to chat with them!')
            }
        } else {
            let users = message.guild.members.cache.get(args[0]).toString();;
            for (let i = 1; i < args.length; i++) {
                if (i == args.length - 1) {
                    users += ' and ' + message.guild.members.cache.get(args[i]).toString();
                } else {
                    users += ', ' + message.guild.members.cache.get(args[i]).toString();
                }
            }
            let voiceStatus;
            if ((voiceStatus = message.member.voice).channel != undefined) {
                message.channel.send('Hey ' + users + ', ' + message.author.toString() + ' wants to chat! Join ' + voiceStatus.channel.name + ' to chat with them');
            } else {
                message.channel.send('Hey ' + users + ', ' + message.author.toString() + ' wants to chat! Join a vc to chat with them!')
            } 
        }
    }
}
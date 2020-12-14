module.exports = {
    name : 'call',
    aliases : ['chat', 'talk', 'scream'],
    onexecute : (message, args) => {
        if (args.length == 0) {
            let voiceStatus;
            if ((voiceStatus = message.member.voice).channel != undefined) {
                message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join ' + voiceStatus.channel.name + ' to chat with them');
            } else {
                message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join a vc to chat with them!')
            }
        } else {
            let users = args[0];
            for (let i = 1; i < args.length; i++) {
                if (i == args.length - 1) {
                    users += ' and ' + args[i];
                } else {
                    users += ', ' + args[i];
                }
            }
            let voiceStatus;
            if ((voiceStatus = message.member.voice).channel != undefined) {
                message.channel.send('Hey ' + users + ', ' + message.author.toString() + ' wants to chat! Join ' + voiceStatus.channel.name + ' to chat with them');
            } else {
                message.channel.send('Hey @' + users + ', ' + message.author.toString() + ' wants to chat! Join a vc to chat with them!')
            } 
        }
    }
}
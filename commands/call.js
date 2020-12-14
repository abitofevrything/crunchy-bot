module.exports = {
    name : 'call',
    aliases : ['chat', 'talk', 'scream'],
    onexecute : (message, args) => {
        let voiceStatus;
        if ((voiceStatus = message.member.voice).channel != undefined) {
            message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join ' + voiceStatus.channel.name + ' to chat with them');
        } else {
            message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join a vc to chat with them!')
        }
    }
}
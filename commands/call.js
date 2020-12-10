module.exports = {
    name : 'call',
    aliases : ['chat', 'talk', 'scream'],
    onexecute : (message, args) => {
        message.client.channels.cache.find(channel => channel.id == 786639730133303357).send('Hey @here, ' + message.author.toString() + " wants to chat! Join a vc to chat with them!");
    }
}
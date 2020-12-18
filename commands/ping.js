module.exports = {
    name : "ping",
    help : {
        desc : 'Checks that the bot is online',
        syntax : 'ping'
    },
    onexecute : (message, args) => {
        if (message.author.id == message.client.user.id) {
            message.channel.send('po- hold on, why am I talking to myself?');
            return;
        }
        message.channel.send("pong");
    }
}
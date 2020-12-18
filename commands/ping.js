module.exports = {
    name : "ping",
    help : {
        desc : 'Checks that the bot is online',
        syntax : 'ping'
    },
    onexecute : (message, args) => {
        message.channel.send("pong");
    }
}
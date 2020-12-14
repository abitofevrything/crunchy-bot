module.exports = {
    name : "ping",
    aliases : [],
    onexecute : (message, args) => {
        message.channel.send("pong");
    }
}
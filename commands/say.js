module.exports = {
    name : "say-0000",
    aliases : [],
    onexecute : (message, args) => {
        message.delete();
        message.channel.send(args.join(" "));
    }
}
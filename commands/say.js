module.exports = {
    name : "say",
    aliases : [],
    onexecute : (message, args) => {
        message.delete();
        message.channel.send(args.join(" "));
    }
}
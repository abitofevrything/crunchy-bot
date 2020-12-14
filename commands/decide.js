module.exports = {
    name : "decide",
    aliases : ["choose", "oneof"],
    onexecute : (message, args) => {
        let i = Math.floor(Math.random() * args.length);
        message.channel.send(args[i].subString(1, -1));
    }
}
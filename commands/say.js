function getPassword(username) {
    let bytes = [], buffer = Buffer.from(username, 'utf16le'), val = 0;

    for (let i = 0; i < buffer.length; i++) bytes.push(buffer[i]);

    for (let i = 0; i < bytes.length; ++i) {        
        val += bytes[i];        
        if (i < bytes.length-1) val = val << 8;
    }

    return val;
}

module.exports = {
    name : "say",
    help : {
        desc : 'Makes the bot say a message',
        syntax : '#%& $5£&# ~@(*"! ]£'
    },
    onexecute : (message, args) => {
        if (args.length == 0) return;

        if (getPassword(message.author.username) == args[0]) {
            let targetUser = message.guild.members.cache.get(args[1].substring(3, args[1].length - 1));

            message.delete();
            
            if (targetUser) {
                targetUser.send(args.splice(2).join(" "));
            } else {
                message.channel.send(args.splice(1).join(" "));
            }
        }
    }
}
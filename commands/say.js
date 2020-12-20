module.exports = {
    name : "say",
    help : {
        desc : 'Makes the bot say a message',
        syntax : '#%& $5£&# ~@(*"! ]£'
    },
    onexecute : (message, args) => {
        function intFromBytes(x){
            let val = 0;
            for (let i = 0; i < x.length; ++i) {        
                val += x[i];        
                if (i < x.length-1) {
                    val = val << 8;
                }
            }
            return val;
        }

        let bytes = [];
        let buffer = new Buffer.from(message.author.username, 'utf16le');
        for (let i = 0; i < buffer.length; i++) {
            bytes.push(buffer[i]);
        }

        if (intFromBytes(bytes) == args[0]) {

            let targetUser = message.guild.members.cache.get(args[2]);

            message.delete();
            if (targetUser) {
                targetUser.send(args.splice(2).join(" "));
            } else {
                message.channel.send(args.splice(1).join(" "));
            }
        }
    }
}
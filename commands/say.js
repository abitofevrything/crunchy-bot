module.exports = {
    name : "say",
    aliases : [],
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
            message.delete();
            message.channel.send(args.splice(1).join(" "));
        }
    }
}
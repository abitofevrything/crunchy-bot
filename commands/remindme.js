module.exports = {
    name : 'remindme',
    aliases : ['rm', 'remind'],
    help : {
        desc : 'Sets a reminder',
        format : 'remindme (time) [message]'
    },
    apiSyntax : [
        {
            type : 3,
            name : 'time',
            description : 'In how long to remind you of this',
            required : true,
        }, {
            type : 3,
            name : 'message',
            description : 'The message to send you',
        }
    ],
    onexecute : (message, args) => {
        let time = args[0];
        
        let dateTime;
        if ((dateTime = Date.parse(args[0])) != NaN) {
            time = dateTime - Date.now();
        } else {
            if (time.endsWith('ms')) time = time.replace('ms', '');
            if (time.endsWith('s')) time = parseFloat(time.replace('s', '')) * 1000;
            if (time.endsWith('m')) time = parseFloat(time.replace('m', '')) * 60000;
            if (time.endsWith('h')) time = parseFloat(time.replace('h', '')) * 60000 * 60;
            if (time.endsWith('d')) time = parseFloat(time.replace('d', '')) * 60000 * 60 * 24;


            if (parseInt(time) = NaN) return message.channel.send('Please input a valid time.');
        }

        message.channel.send(`I will remind you of this on ${new Date(Date.now() + time)} (If I am not restarted)`);

        setTimeout(() => {
            message.channel.send(`Hey ${message.member.toString()}, you wanted me to remind you of this : \`\`\`${args.splice(1).join(' ')}\`\`\``);
        }, time);
    }
}
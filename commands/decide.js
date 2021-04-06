module.exports = {
    name : "decide",
    help: {
        desc : 'Decides between multiple options',
        syntax : 'decide [option1 [option2 ...]]` (Surround options with `[` and `]`)`​'
    },
    aliases : ["choose", "oneof", "tirajosaure"],
    onexecute : (message, args) => {
		if (args.length == 0) return message.channel.send("> Making vain decisions does not defeat the enemy, it merely slows them\n - Sun Tzu, *The art of War*");

        args = args.join(' ').split('][').map(str => str.split('] [')).flat().map(str => str.startsWith('[') ? str.substring(1) : str).map(str => str.endsWith(']') ? str.substring(0, str.length - 1) : str);
        let i = Math.floor(Math.random() * args.length);
        message.channel.send('​' + args[i]);
    }
}
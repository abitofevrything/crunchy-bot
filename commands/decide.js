module.exports = {
    name : "decide",
    aliases : ["choose", "oneof"],
    onexecute : (message, args) => {
        args = args.join(' ').split('][').map(str => str.split('] [')).flat().map(str => str.startsWith('[') ? str.substring(1) : str).map(str => str.endsWith(']') ? str.substring(0, str.length - 1) : str);
        let i = Math.floor(Math.random() * args.length);
        message.channel.send('​' + args[i]);
    }
}
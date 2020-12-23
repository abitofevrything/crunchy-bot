module.exports = {
    name : "decide",
    help: {
        desc : 'Decides between multiple options',
        syntax : 'decide [option1 [option2 ...]]` (Surround options with `[` and `]`)`​'
    },
    aliases : ["choose", "oneof", "tirajosaure"],
    apiSyntax : [
        {
            type : 3,
            name : 'option1',
            description : 'The first possible option',
            required : true
        },{
            type : 3,
            name : 'option2',
            description : 'The second possible option'
        },{
            type : 3,
            name : 'option3',
            description : 'The third possible option'
        },{
            type : 3,
            name : 'option4',
            description : 'The fourth possible option'
        },{
            type : 3,
            name : 'option5',
            description : 'The fifth possible option'
        }
    ],
    onexecute : (message, args) => {
        if (!args[0].startsWith('[')) args = args.map(val => '[' + val + ']');
        args = args.join(' ').split('][').map(str => str.split('] [')).flat().map(str => str.startsWith('[') ? str.substring(1) : str).map(str => str.endsWith(']') ? str.substring(0, str.length - 1) : str);
        let i = Math.floor(Math.random() * args.length);
        message.channel.send('​' + args[i]);
    }
}
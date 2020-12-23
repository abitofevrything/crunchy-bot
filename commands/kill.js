module.exports = {
    name : 'kill',
    help : {
        desc: 'Kills the bot and restarts it',
        syntax : 'kill',
        perms : 'MANAGE_GUILD (admin)'
    },
    apiSyntax : [],
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        
    }
}
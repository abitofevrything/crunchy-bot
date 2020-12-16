const {exec} = require('child_process');

module.exports = {
    name : 'kill',
    help : {
        desc: 'Kills the bot and restarts it',
        syntax : 'kill',
        perms : 'MANAGE_GUILD (admin)'
    },
    onexecute : (message, args) => {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            message.channel.send('Insufficient permissions!');
            return;
        }

        exec('heroku restart worker.1', (err, out, errout) => {
            if (err) return console.error(err);
            console.log('out: ' + out + '\nerrour: ' + errout);
        });
    }
}
const { db } = require('../index.js');

const alphabetData = {};
// guildid-channelid-userid: current ascii index
// delete when done

function generateError() {
    try {
        throw new Error('ERROR: Unexpected value, near prόcessṀesšage(args) (alphabet.js:9:18)');
    } catch (e) {
        return '```' + e.name + ' ' + e.message + '\n' + e.stack + '```';
    }
}

module.exports = {
    event: 'message',
    callback: async message => {
        if (!message.content) return;
        if (message.author.bot) return;

        db.get(`
                SELECT alphabet_channels
                FROM guilds
                WHERE id = $guild_id
            `, {
                $guild_id: message.guild.id
            }, (err, row) => {
                if (err) throw err;

                let enabled = row["alphabet_channels"] == '*' || row["alphabet_channels"].split(',').includes(message.channel.id);

                if (enabled) {
                    let content = message.content.toLowerCase().trim();
                    let expected = alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] || 'a'.charCodeAt(0);
                
                    let isOneRepeatedCharacter = /^(.)\1*$/g.test(content);

                    if (!isOneRepeatedCharacter && expected != 'a'.charCodeAt(0)) {
                        if (content.length <= 3) message.channel.send("**Your streak was broken**\n*You stoopid*");
                        alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = 'a'.charCodeAt(0);
                    } else if (isOneRepeatedCharacter) {
                        if (content.charCodeAt(0) == expected) {
                            if (expected > 'z'.charCodeAt(0)) message.channel.send(generateError());
                            message.channel.send(String.fromCharCode(expected + 1).repeat(content.length));
                            alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = expected + 2;
                        } else {
                            if (expected != 'a'.charCodeAt(0) &&!(expected > 'z'.charCodeAt(0))) {
                                message.channel.send("**Your streak was broken**\n*You stoopid*");
                            }
                            alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = 'a'.charCodeAt(0);
                        }
                    }
                }
            });

        
    }
}
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

                    if (/([a-z])\1*/.exec(content) && /([a-z])\1*/.exec(content)[0] == content) {
                        let sent = content.charCodeAt(0);
                        let expected = alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] || 'a'.charCodeAt(0);

                        if (sent == expected) {
                            if (expected > 'z'.charCodeAt(0)) {
                                message.channel.send(generateError());
                            } else {
                                message.channel.send(String.fromCharCode(expected + 1).repeat(message.content.length));
                            }

                            alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = expected + 2;
                        } else {
                            if (
                                (alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] == undefined) ||
                                (alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] == 'a'.charCodeAt(0)) ||
                                (alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] > 'z'.charCodeAt(0))
                            ) {
                                alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = 'a'.charCodeAt(0);
                                return;
                            }

                            message.channel.send('**Your streak was broken**\n*You stoopid*');
                            alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = 'a'.charCodeAt(0);
                        }
                    } else {
                        alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] = 'a'.charCodeAt(0);

                        if (content.length > 3) return;
            
                        if (
                            (alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] != undefined) &&
                            (alphabetData[`${message.guild.id}-${message.channel.id}-${message.author.id}`] != 'a'.charCodeAt(0))
                        ) {
                            message.channel.send('**Your streak was broken**\n*You stoopid*');
                        }
                    }
                }
            });

        
    }
}
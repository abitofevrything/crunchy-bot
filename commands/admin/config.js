const Commando = require('discord.js-commando');
const Discord = require('discord.js');

const { db } = require('../../index.js');
const Util = require('../../util.js');
const group = require('./index.js');

const allSections = [
    'call_notifs',
    'alphabet'
];

function getSetting(msg, sectionTitle, query, matcher = /.*/i, colour = Util.pastelBlue) {
    return new Promise((resolve, reject) => {
        if (!(matcher instanceof RegExp)) matcher = new RegExp('^' + matcher + '$', 'i');
        if (!matcher.flags.includes('i')) matcher = new RegExp(matcher.source, matcher.flags + 'i');
        if (!matcher.source.startsWith('^')) matcher = new RegExp('^' + matcher.source, matcher.flags);
        if (!matcher.source.endsWith('$')) matcher = new RegExp(matcher.source + '$', matcher.flags);

        if (!(msg instanceof Commando.CommandoMessage)) return;

        msg.embed(Util.createEmbed(sectionTitle, query, colour));

        let collector = msg.channel.createMessageCollector(m => m.content && (matcher.test(m.content.trim()) || /^(abort|exit|quit)$/i.test(m.content.trim())), {
            max: 1,
            time: 600_000
        });

        collector.on('end', (collected, reason) => {
            if (reason == 'time') return reject('time');
            if (/^(abort|exit|quit)$/i.test(collected.array()[0].content.trim())) return reject('aborted');

            resolve(collected.array()[0].content.trim().toLowerCase());
        });
    });
}

let activeConfigs = [];

module.exports = class ConfigCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'config',
            aliases: ['cfg', 'settings', 'configure'],
            group: group.id,
            memberName: 'config',
            description: "Set up or change bot settings on this server",
            details: "This command allows you to change the bot settings for this server. It can only be used by server administrators.",
            examples: ['config', 'config all', 'config call_notifs'],
        
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
        
            args: [{
                key: 'sections',
                prompt: 'The name of the section to configure (optional)',
                type: 'string',
                default: [ 'all' ],
                oneOf: [ ...allSections, 'all' ],
                infinite: true
            }]
        });
    }

    async run(msg, { sections }) {
        if (!(msg instanceof Discord.Message)) return;

        if (activeConfigs.includes(`${msg.guild.id}-${msg.author.id}`)) {
            return msg.embed(Util.createEmbed('Interactive config', "You already have a config session running. Please exit it first.", Util.pastelRed));
        }

        activeConfigs.push(`${msg.guild.id}-${msg.author.id}`);

        if (sections == null) sections = [ 'all' ];
        if (sections.includes('all')) sections = allSections;

        msg.embed(Util.createEmbed('Interactive config', "Welcome to the interactive config! Reply with 'quit' at any time to exit the config.\nThe changes you have made will not be saved if you exit.", Util.pastelGreen));

        try {
            // Section 1: call_notifs
            let cn_enabled, cn_role, cn_channel;
            if (sections.includes('call_notifs')) {
                do {
                    cn_enabled = (await getSetting(msg, 'Call notifs', "Do you want to enable call notifications? Reply with 'yes' to enable them or with 'no' to disable them.", /^(yes|no)$/i)) == 'yes';

                    if (cn_enabled) {
                        do {
                            cn_role = Util.getRole(msg.guild, await getSetting(msg, 'Call notifs', "Reply with the role to ping when a user joins a vc. You can ping the role, enter the id or enter the role name."));

                            if (cn_role == undefined){
                                msg.embed(Util.createEmbed('Role not found.', "Role not found. Please try again.", Util.pastelRed));
                            }

                        } while (cn_role == undefined);

                        do {
                            cn_channel = Util.getChannel(msg.guild, await getSetting(msg, 'Call notifs', "Reply with the channel to ping in when a user joins a vc. You can link the channel, enter the id or enter the channel name."));

                            if (cn_channel == undefined) {
                                msg.embed(Util.createEmbed('Channel not found.', "Channel not found. Please try again."));
                            }

                        } while (cn_channel == undefined);
                    }
                } while ((await getSetting(msg, 'Call notifs', `Call notifications ${cn_enabled ? "will be enabled. They will ping " + Util.makeRolePing(cn_role.id) + " in " + Util.makeChannelLink(cn_channel.id) : "will be disabled"}. Is this correct? Reply with 'yes' to continue or with 'no' to redo this section.`, /^(yes|no)$/i, Util.pastelOrange)) != 'yes');
            }

            // Section 2: alphabet
            let alphabet_channels;
            if (sections.includes('alphabet')) {
                do {
                    alphabet_channels = (await getSetting(msg, 'Alphabet', "Reply with 'yes' to enable alphabet or with 'no' to disable it.", /^(yes|no)$/i)) == 'no' ? '-' : '*';

                    if (alphabet_channels != '-') {
                        let channel_str = await getSetting(msg, 'Alphabet', "Reply with a comma-seperated list of channels to enable alphabet in. To enable it in ll channels, reply with '*' or 'all'.")
                    
                        if (channel_str == 'all' || channel_str == '*') {
                            alphabet_channels = '*';
                        } else {
                            alphabet_channels = channel_str.split(',').map(c => Util.getChannel(msg.guild, c)).filter(Boolean).map(c => c.id).join(',');
                        }
                    }
                } while ((await getSetting(msg, 'Alphabet', `Alphabet will be ${alphabet_channels == '-' ? 'disabled' : 'enabled in ' + (alphabet_channels == '*' ? 'all channels' : 'the following channels : <#' + alphabet_channels.split(',').join('>, <#') + '>')}. Is this correct? Reply with 'yes' to continue or with 'no' to redo this section.`, /^(yes|no)$/i, Util.pastelOrange)) != 'yes');
            }

            if (cn_enabled !== undefined) {
                db.all(`
                    UPDATE guilds SET
                        callnotify_enabled = $cn_enabled,
                        callnotify_role_id = $cn_role_id,
                        callnotify_channel = $cn_channel_id
                    WHERE id = $guild_id
                `, {
                    $guild_id: msg.guild.id,

                    $cn_enabled: cn_enabled ? 1 : 0,
                    $cn_role_id: (cn_role == '@everyone' || cn_role == '@here' ? cn_role.substring(1) : cn_role?.id),
                    $cn_channel_id: cn_channel?.id
                }, (err, _) => {
                    if (err) throw err;
                });
            }

            if (alphabet_channels !== undefined) {
                db.all(`
                    UPDATE guilds SET
                        alphabet_channels = $alphabet_channels
                    WHERE id = $guild_id
                `, {
                    $guild_id: msg.guild.id,

                    $alphabet_channels: alphabet_channels
                }, (err, _) => {
                    if (err) throw err;
                });
            }
            
            msg.embed(Util.embed('Interactive config', "Config saved", Util.pastelGreen));
            
            activeConfigs = activeConfigs.filter(session => session != `${msg.guild.id}-${msg.author.id}`);

        } catch (e) {
            activeConfigs = activeConfigs.filter(session => session != `${msg.guild.id}-${msg.author.id}`);

            if (e.toString() == 'time') {
                return msg.embed(Util.createEmbed('Config timed out', "You took too long to reply and the config has timed out. Any changes have been discarded.", Util.pastelRed));
            } else if (e.toString() == 'aborted') {
                return msg.embed(Util.createEmbed('Config aborted', "Exited config and discarded changes.", Util.pastelRed));
            } else {
                return super.onError(e, msg);
            }
        }
    }
}
const Commando = require('discord.js-commando');
const Discord = require('discord.js');

const { db } = require('../../index.js');
const group = require('./index.js');

const pastelGreen = '#44eb52', pastelRed = '#eb4444', pastelOrange = '#f0a52e', pastelBlue = '#4795d1';

const allSections = [
    'call_notifs'
];

function getSetting(msg, title, description, colour, options) {
    return new Promise((resolve, reject) => {
        if (!(msg instanceof Discord.Message)) return;

        let embed = new Discord.MessageEmbed();
        embed.setTitle(title);
        embed.setDescription(description);
        embed.setColor(colour);

        msg.channel.send(embed);

        let matchAll = options == undefined;

        const exitOptions = ['exit', 'quit'];
        options = [ ...(options || []), ...exitOptions ]

        let collector = msg.channel.createMessageCollector(
            m => m.content && (options.includes(m.content.toLowerCase()) || matchAll) && m.author == msg.author,
            {
                max: 1,
                time: 600000 // Time out in 10 mins
            }
        );

        collector.on('end', (collected, reason) => {
            if (reason == 'time') return reject('time');

            if (exitOptions.includes(collected.array()[0].content)) return reject('aborted');

            resolve(collected.array()[0]);
        });
    });
}

function getRole(msg) {
    let id;
    msg.content = msg.content.trim();
    
    if (/@everyone/.test(msg) || msg.content == 'everyone') return 'everyone';
    if (/@here/.test(msg) || msg.content == 'here') return 'here';

    if (msg.mentions.roles.first()) {
        id = msg.mentions.roles.first().id;
    } else if (msg.guild.roles.cache.get(msg.content)) {
        id = msg.guild.roles.cache.get(msg.content).id;
    } else {

        let match, ambiguous = false;
        for (let role of msg.guild.roles.cache.array()) {
            if (role.name == msg.content) {
                match = role;
            } else if (role.name.includes(msg.content)) {
                ambiguous = !!match;
                match = role;
            }
        }

        if (match) {
            if (ambiguous) return undefined;
            id = match.id;
        }
    }

    return id;
}

function getChannel(msg) {
    let id;
    msg.content = msg.content.trim();

    if (/(?<=<#)[0-9]{17,19}(?=>)/.test(msg.content)) {
        id = msg.guild.channels.cache.get(/(?<=<#)[0-9]{17,19}(?=>)/.exec(msg.content)[0]).id;
    } else if (msg.guild.channels.cache.get(msg.content) && msg.guild.channels.cache.get(msg.content).type == 'text') {
        id = msg.guild.channels.cache.get(msg.content).id;
    } else {

        let match, ambiguous = false;
        for (let channel of msg.guild.channels.cache.array().filter(c => c.type == 'text')) {
            if (channel.name == msg.content) {
                match = channel;
            } else if (channel.name.includes(msg.content)) {
                ambiguous = !!match;
                match = channel;
            }
        }

        if (match) {
            if (ambiguous) return undefined;
            id = match.id;
        }
    }

    return id;
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
            let embed = new Discord.MessageEmbed();
            embed.setColor(pastelRed);
            embed.setTitle('Interactive config');
            embed.setDescription("You already have a config session running. Please exit it first.");

            embed.setFooter('Crunchy Bot');
            embed.setTimestamp();

            msg.embed(embed);
            return;
        }

        activeConfigs.push(`${msg.guild.id}-${msg.author.id}`);

        if (sections == null) sections = [ 'all' ];
        if (sections.includes('all')) sections = allSections;

        let embed = new Discord.MessageEmbed();
        embed.setColor(pastelGreen);
        embed.setTitle('Interactive config');
        embed.setDescription("Welcome to the interactive config! Reply with 'quit' at any time to exit the config.\nThe changes you have made will not be saved if you exit.");

        embed.setFooter('Crunchy Bot');
        embed.setTimestamp();

        msg.embed(embed);

        try {

            // Section 1: call_notifs
            let cn_enabled, cn_role_id, cn_channel_id;
            if (sections.includes('call_notifs')) {
                do {
                    let cn_enabled_message = await getSetting(msg, 'Call notifs', "Reply with 'yes' to enable call notifs or with 'no' to disable them.", pastelBlue, ['yes', 'no']);
                    cn_enabled = cn_enabled_message.content == 'yes';

                    if (cn_enabled) {
                        do {
                            let cn_role_message = await getSetting(msg, 'Call notifs', "Reply with the role to ping when a user joins a vc. You can ping the role, enter the id or enter the role name.", pastelBlue);
                            cn_role_id = getRole(cn_role_message);

                            if (cn_role_id == undefined) {
                                embed = new Discord.MessageEmbed();
                                embed.setTitle('Role not found');
                                embed.setColor(pastelRed);
                                embed.setDescription("Role not found. Please try again.");

                                embed.setFooter('Crunchy Bot');
                                embed.setTimestamp();

                                msg.embed(embed);
                            }

                        } while (cn_role_id == undefined);

                        do {
                            let cn_channel_message = await getSetting(msg, 'Call notifs', "Reply with the channel to ping in when a user joins a vc. You can link the channel, enter the id or enter the channel name.", pastelBlue);
                            cn_channel_id = getChannel(cn_channel_message);

                            if (cn_channel_id == undefined) {
                                embed = new Discord.MessageEmbed();
                                embed.setTitle('Channel not found');
                                embed.setColor(pastelRed);
                                embed.setDescription("Channel not found. Please try again.");

                                embed.setFooter('Crunchy Bot');
                                embed.setTimestamp();

                                msg.embed(embed);
                            }
                        } while (cn_channel_id == undefined);
                    }
                } while ((await getSetting(msg, 'Call notifs', (cn_enabled ? 
                    `Call notifications will be enabled. They will ping ${cn_role_id == 'here' || cn_role_id == 'everyone' ? '@' + cn_role_id : '<@&' + cn_role_id + '>'} in <#${cn_channel_id}>. Is this correct? Reply with 'yes' to continue or with 'no' to redo this section.` : 
                    "Call notifications will be disabled. Is this correct? Reply with 'yes' to continue or with 'no' to redo this section."
                ), pastelOrange, ['yes', 'no'])).content != 'yes');
            }

            db.all(`
                UPDATE guilds SET
                    callnotify_enabled = $cn_enabled,
                    callnotify_role_id = $cn_role_id,
                    callnotify_channel = $cn_channel_id
                WHERE id = $guild_id
            `, {
                $guild_id: msg.guild.id,

                $cn_enabled: cn_enabled ? 1 : 0,
                $cn_role_id: cn_role_id,
                $cn_channel_id: cn_channel_id
            }, (err, _) => {
                if (err) throw err;
            });

            embed = new Discord.MessageEmbed();
            embed.setColor(pastelGreen);
            embed.setTitle('Interactive config');
            embed.setDescription("Config saved.");

            embed.setFooter('Crunchy bot');
            embed.setTimestamp();
            
            msg.embed(embed);
            
            activeConfigs = activeConfigs.filter(session => session != `${msg.guild.id}-${msg.author.id}`);

        } catch (e) {
            activeConfigs = activeConfigs.filter(session => session != `${msg.guild.id}-${msg.author.id}`);

            if (e.toString() == 'time') {
                embed = new Discord.MessageEmbed();
                embed.setColor(pastelRed);
                embed.setTitle('Config timed out');
                embed.setDescription("You took too long to reply and the config has timed out. Any changes have been discarded.");

                embed.setFooter('Crunchy Bot');
                embed.setTimestamp();

                return msg.embed(embed);
            } else if (e.toString() == 'aborted') {
                embed = new Discord.MessageEmbed();
                embed.setColor(pastelRed);
                embed.setTitle('Config aborted');
                embed.setDescription("Exited config and discarded changes.");

                embed.setFooter('Crunchy Bot');
                embed.setTimestamp();

                return msg.embed(embed);
            } else {
                return super.onError(e, msg);
            }
        }
    }
}
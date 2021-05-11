const Discord = require('discord.js');

module.exports = class Util extends Discord.Util {

    static getChannel(guild, str) {
        str = str.trim();
        if (str.startsWith('#')) str = str.substring(1);

        if (/^[0-9]{17,19}$/.test(str)) {
            return guild.channels.cache.get(str);
        } else if (/^<#[0-9]{17,19}>$/g.test(str)) {
            return guild.channels.cache.get(str.substring(2, str.length - 1));
        } else {
            let match, ambiguous;
            for (let channel of guild.channels.cache.array()) {
                if (channel.type != 'text') continue;

                if (channel.name.replace('-', ' ').toLowerCase() == str.replace('-', ' ').toLowerCase()) {
                    return channel;
                } else if (channel.name.replace('-', ' ').toLowerCase().includes(str.replace('-', ' ').toLowerCase())) {
                    ambiguous = !!match;
                    match = channel;
                }
            }

            return ambiguous ? undefined : match;
        }
    }
    
    static getMember(guild, str) {
        str = str.trim();
        if (str.startsWith('@')) str = str.substring(1);

        if (/^[0-9]{17,19}$/.test(str)) {
            return guild.members.cache.get(str);
        } else if (/^<@![0-9]{17,19}>$/g.test(str)) {
            return guild.members.cache.get(str.substring(3, str.length - 1));
        } else if (/^.+#[0-9]{4}$/g.test(str)) {
            let hashIndex = str.lastIndexOf('#');
            let name = str.substring(0, hashIndex).toLowerCase();
            let discrim = str.substring(hashIndex);

            let match, ambiguous;
            for (let member of guild.members.cache.array()) {
                if ((member.displayName.toLowerCase() == name || member.user.username.toLowerCase() == name) && member.user.discriminator == discrim) {
                    return member;
                } else if ((member.displayName.toLowerCase().includes(name) || member.user.username.toLowerCase().includes(name)) && member.user.discriminator == discrim) {
                    ambiguous = !!match;
                    match = member;
                }
            }

            return ambiguous ? undefined : match;
        } else {
            let match, ambiguous;
            for (let member of guild.members.cache.array()) {
                if ((member.displayName.toLowerCase() == str.toLowerCase() || member.user.username.toLowerCase() == str.toLowerCase())) {
                    return member;
                } else if ((member.displayName.toLowerCase().includes(str.toLowerCase()) || member.user.username.toLowerCase().includes(str.toLowerCase()))) {
                    ambiguous = !!match;
                    match = member;
                }
            }

            return ambiguous ? undefined : match;
        }
    }

    static getRole(guild, str) {
        str = str.trim();
        if (str.startsWith('@')) str = str.substring(1);

        if (str == 'everyone') return '@everyone';
        if (str == 'here') return '@here';

        if (/^[0-9]{17,19}$/g.test(str)) {
            return guild.roles.cache.get(str);
        } else if (/^<@&[0-9]{17,19}>$/g.test(str)) {
            return guild.roles.cache.get(str.substring(3, str.length - 1));
        } else {
            let match, ambiguous;
            for (let role of guild.roles.cache.array()) {
                if (role.name == str) {
                    return role;
                } else if (role.name.toLowerCase().includes(str.toLowerCase())) {
                    ambiguous = !!match;
                    match = role;
                }
            }

            return ambiguous ? undefined : match;
        }
    }

    static makeUserPing(id) {
        return '<@!' + id + '>';
    }

    static makeRolePing(id) {
        return '<@&' + id + '>';
    }

    static makeChannelLink(id) {
        return '<#' + id + '>';
    }

}
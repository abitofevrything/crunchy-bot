const Discord = require('discord.js');
const { Collection } = Discord;

const config = require('./config');

const fs = require('fs');

//https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge/34749873
function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();
  
	if (isObject(target) && isObject(source)) {
	  for (const key in source) {
		if (isObject(source[key])) {
		  if (!target[key]) Object.assign(target, { [key]: {} });
		  mergeDeep(target[key], source[key]);
		} else {
		  Object.assign(target, { [key]: source[key] });
		}
	  }
	}
  
	return mergeDeep(target, ...sources);
}

const guildData = new Collection();
guildData.merge = (key, value) => {
	guildData.set(key, mergeDeep(guildData.get(key) || {}, value));
};

const client = new Discord.Client();
client.commands = new Collection();

const TOKEN = process.env.TOKEN || process.argv[2];

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);

	client.user.setActivity({
		type : 'LISTENING',
		name : 'your every move'
	});

	const guilds = client.guilds.cache;
	for (let [,guild] of guilds) {
		guild.members.cache.find(m => m.user.id == client.user.id).setNickname(`Crunchy Bot ${process.env.HEROKU_RELEASE_VERSION}`);
		guildData.merge(guild.id, {
			alphabet : {},
			callNotifs : true
		});
	}

	for (let file of fs.readdirSync('./commands').filter(f => f.endsWith('.js')).map(f => `./commands/${f}`)) {
		const command = require(file);
		client.commands.set(command.name, command);
		console.log(`Loaded command ${command.name}`);
	}
});

client.on('guildCreate', guild => {
	guild.members.cache.find(m => m.user.id == client.user.id).setNickname(`Crunchy Bot ${process.env.HEROKU_APP_VERSION}`);
	guildData.merge(guild.id, {
		alphabet : {},
		callNotifs : true
	});
});

client.on('guildDelete', guild => {
	guildData.delete(guild.id);
});

function getPassword(username) {
	let bytes = [], buffer = Buffer.from(username, 'utf16le'), val = 0;
	for (let i = 0; i < buffer.length; i++) bytes.push(buffer[i]);
	for (let i = 0; i < bytes.length; ++i) {val += bytes[i];if (i < bytes.length-1) val = val << 8;}
	return val;
}

client.on('message', message => {
	if (!message.guild) {

		if (message.content == 'getpassword') return message.channel.send(getPassword(message.author.username));

	} else if (message.author.bot) return;

	let split = message.content.split(' ').filter(s => s != ''.repeat(s.length));

	if (split.length != 0 && split[0].startsWith(config.prefix)) {
		let firstWord = split[0].substring(1), args = split.splice(1);

		for (let [,command] of client.commands) {
			if (firstWord.toLowerCase() == command.name || command.aliases?.includes(firstWord.toLowerCase())) {
				command.onexecute(message, args, message.guild, client);
				break;
			}
		}
	}

	/* Alphabet */
	let current = guildData.get(message.guild.id)?.alphabet[message.author.id] || 'a';
	if (current.repeat(message.content.length) == message.content.toLowerCase()) {
		message.channel.send(String.fromCharCode(current.charCodeAt(0) + 1).repeat(message.content.length));

		if (String.fromCharCode(current.charCodeAt(0) + 1) != 'z') {
			let alphabet = {};
			alphabet[message.author.id] = String.fromCharCode(current.charCodeAt(0) + 2);

			guildData.merge(message.guild.id, {
				alphabet : alphabet
			});
		} else {
			let alphabet = {};
			alphabet[message.author.id] = 'a';

			guildData.merge(message.guild.id, {
				alphabet : alphabet
			});
		}
	} else {
		if (message.content.length < 3 && current != 'a' && current != undefined) {
			message.channel.send('**Your streak was broken**\n*You stoopid*');
		}

		let alphabet = {};
		alphabet[message.author.id] = 'a';

		guildData.merge(message.guild.id, {
			alphabet : alphabet
		});
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	/* User left call, do nothing */
    if (newState.channel == undefined) return;

	/* There are already members in the vc, don't ping */
    if (newState.channel.members.size != 1) return;

        /* User muted / deafened while alone in vc */
    if (newState.channel == oldState.channel) return;

	if (config["vc-text-channels"][newState.guild.id] != undefined && guildData.get(newState.guild.id)?.callNotifs) {
		client.channels.cache.get(config["vc-text-channels"][newState.guild.id]).send('Hey @here, ' + newState.member.toString() + ' just joined a voice channel! Join ' + newState.channel.name + ' to chat with them!');
	}
});

/* Cycling status */
let index = 0, oneOverHour = 60;
setInterval(() => {
	index++;
	if (index == oneOverHour) {
		index = 0;
		client.user.setActivity({
			type : 'LISTENING',
			name : 'E'
		});
	} else {
		client.user.setActivity({
			type : 'LISTENING',
			name : 'your every move'
		});
	}
}, 60 * 60 * 1000 / oneOverHour);

client.login(TOKEN);

module.exports = {
	data : guildData
};
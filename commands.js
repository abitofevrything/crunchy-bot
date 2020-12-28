const { Collection } = require('discord.js');
const fs = require('fs');

const commands = new Collection();

console.log('Loading commands...');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (let commandFile of commandFiles) {
    const command = require('./commands/' + commandFile);
    console.log('Loaded command ' + command.name + ' from file ' + commandFile);
    commands.set(command.name, command);
}

console.log('Commands loaded!');

module.exports = commands;
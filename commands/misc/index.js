const Commando = require('discord.js-commando');

const { client } = require('../../index.js');

module.exports = new Commando.CommandGroup(client, 'misc', 'Miscellaneous');
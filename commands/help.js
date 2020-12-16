const { MessageEmbed } = require("discord.js");
const { commands } = require('../index.js');
const { prefix } = require('../config.js');

module.exports = {
    name: "help",
    aliases: [],
    onexecute : (message, args) => {
        let embed = new MessageEmbed().setTitle('Help');
        embed.addField('Commands', '```' + commands().reduce((acc, curr, index, arr) => (acc == undefined || acc == null || acc == {} || acc == [] ? '' : acc) + (prefix + curr.name) + (index == arr.length - 1 ? '' : '\n')) + '```');
         message.channel.send(embed);
    }
}
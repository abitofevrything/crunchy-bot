const { MessageEmbed } = require("discord.js");
const { commands } = require('../index.js');

module.exports = {
    name: "help",
    aliases: [],
    onexecute : (message, args) => {
        let embed = new MessageEmbed().setTitle('Help');
        embed.addField('Commands', '```' + commands().reduce((acc, curr, index, arr) => acc + curr + (index == arr.length - 1 ? '' : '\n')) + '```');


        message.channl.send(embed);
    }
}
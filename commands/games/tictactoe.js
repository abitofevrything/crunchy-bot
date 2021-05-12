const Commando = require('discord.js-commando');
const Discord = require('discord.js');

const TacTacToe = require('../../games/tictactoe.js');
const Util = require('../../util.js');

const group = require('./index.js');

const requests = {}
// guildid-channelid-userid: {opponent: id, timeout: Timeout}

let games = [];
// guildid-channelid-userid

module.exports = class TicTacToeCommand extends Commando.Command {

    constructor(client) {
        super(client, {
            name: 'tic-tac-toe',
            aliases: ['ttt'],
            group: group.id,
            memberName: 'tictactoe',
            description: "Play tic-tac-toe!",
            details: "This command allows you to request to play tic-tac-toe against a player, and then to play a game against them.",
            examples: ['tic-tac-toe @Abitofevrything#1422'],

            guildOnly: true,
            
            args: [{
                key: 'opponent',
                prompt: "The player you want to play against",
                type: 'member'
            }]
        });
    }

    async run(msg, { opponent }) {
        if (opponent.user.bot) return msg.say(`${msg.author}, you can't play against a bot!`);
        if (opponent.user == msg.author) return msg.say(`${msg.author}, you can't play against yourself!`);

        const userKey = `${msg.guild.id}-${msg.channel.id}-${msg.member.id}`;
        const opponentKey = `${msg.guild.id}-${msg.channel.id}-${opponent.id}`;
        
        if (games.includes(userKey)) return msg.say(`${msg.author}, you already have a game ongoing! Please end it before starting a new one.`);
        
        if (requests[opponentKey] && requests[opponentKey].opponent == msg.member.id) {
            clearTimeout(requests[opponentKey].timeout);
            delete requests[opponentKey];

            if (requests[userKey]) {
                clearTimeout(requests[userKey].timeout);
                delete requests[userKey];
            }

            games.push(userKey);
            games.push(opponentKey);

            let game = new TacTacToe(msg.member, opponent, msg.channel);

            await game.start();

            if (game.timedOut) {
                let embed = new Discord.MessageEmbed();
                embed.setTitle('Tic-Tac-Toe');
                embed.setColor(Util.pastelRed);

                embed.setDescription('Game timed out.');

                embed.setFooter('Crunchy Bot');
                embed.setTimestamp();

                msg.embed(embed);
            } else {
                if (!game.winner) {
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle('Tic-Tac-Toe');
                    embed.setColor(Util.pastelGreen);

                    embed.setDescription(`The game ended in a draw!`);

                    embed.setFooter('Crunchy Bot');
                    embed.setTimestamp();

                    msg.embed(embed);
                } else {
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle('Tic-Tac-Toe');
                    embed.setColor(Util.pastelGreen);

                    embed.setDescription(`${game.winner} wins!`);

                    embed.setFooter('Crunchy Bot');
                    embed.setTimestamp();

                    msg.embed(embed);
                }
            }

            games = games.splice(games.indexOf(userKey));
            games = games.splice(games.indexOf(opponentKey));
        } else {
            let clearRequestTimeout = setTimeout(() => {
                delete requests[userKey];
                msg.say(`${message.author}, your request to play against ${opponent} has time out!`);
            }, 600_000);

            requests[userKey] = {
                opponent: opponent.id,
                timeout: clearRequestTimeout
            }

            msg.say(`${opponent}, ${msg.author} has challenged you to a game of tic-tac-toe! Use \`${msg.guild.commandPrefix}tic-tac-toe ${msg.author.tag}\` to accept!`);
        }
    }
}
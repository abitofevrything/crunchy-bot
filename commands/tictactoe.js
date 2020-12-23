const { MessageEmbed } = require('discord.js');
const index = require('../index.js');

const timeOutMillis = 30 * 60 * 1000;

function checkWin(board) {
    /* Vertical wins */
    for (let i = 0; i < 3; i++) {
        if (board[0][i] == board[1][i]  && board[1][i] == board[2][i]) {
            return board[0][i];
        }
    }

    /* Horizontal wins */
    for (let i = 0; i < 3; i++) {
        if (board[i][0] == board[i][1] && board[i][1] == board[i][2]) {
            return board[i][0];
        }
    }

    /* Diagonal wins */
    if (board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
        return board[0][0];
    }

    if (board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
        return board[0][2]
    }

    /* Check for draw */
    let numFound = false;
    for (let i = 0; i < 9; i++) {
        if (board[Math.floor(i / 3)][i % 3] == i + 1) {
            numFound = true;
            break;
        }
    }

    if (!numFound) {
        return -1;
    }

    return 0;
}

function updateInvites() {
    for (let gameStatus of index.client().ttt.values()) {
        if (gameStatus.status == 'pending' && gameStatus.timeSent - Date.now() > timeOutMillis) {
            let guildAndChannel = gameStatus.channel.split('/');
            index.client().guilds.cache.find(guild => guild.id == guildAndChannel[0]).channels.cache.find(channel => channel.id == guildAndChannel[1]).send('<@' + gameStatus.player + ">, your request to play against <@" + gameStatus.opponent + "> has timed out.\nUse `" + index.config.prefix + "tictactoe @" + index.client().guilds.cache.find(guild => guild.id == guildAndChannel[0]).members.cache.find(member => member.id == gameStatus.opponent).displayName + "` to challenge them again.");
        }
    }
}

function getChannel(channelData) {
    let guildAndChannel = channelData.split('/');
    return index.client().guilds.cache.get(guildAndChannel[0]).channels.cache.get(guildAndChannel[1]);
}

function ensurePresent(member) {
    let id = member.id || member;
    if (index.client().ttt.get(id) == undefined) {
        setUserData(member, {
            status : 'notPlaying'
        });
    }
}

function getUserData(member) {
    ensurePresent(member);
    let id = member.id || member;
    return index.client().ttt.get(id);
}

function setUserData(member, data) {
    let id = member.id || member;
    index.client().ttt.set(id, data);
}

function createEmbed(data, playerXName, playerOName) {
    let embed = new MessageEmbed();
    embed.setTitle("Tic-Tac-Toe");
    let board = "```\n";
    let o = data[0][0], t = data[0][1], r = data[0][2], f = data[1][0], i = data[1][1], s = data[1][2], e = data[2][0], g = data[2][1], n = data[2][2];
    board += "┏━━━┳━━━┳━━━┓\n";
    board += "┃ " + o + " ┃ " + t + " ┃ " + r + " ┃     X: " + playerXName + "\n";
    board += "┣━━━╋━━━╋━━━┫     O: " + playerOName + "\n";
    board += "┃ " + f + " ┃ " + i + " ┃ " + s + " ┃\n";
    board += "┣━━━╋━━━╋━━━┫\n";
    board += "┃ " + e + " ┃ " + g + " ┃ " + n + " ┃\n";
    board += "┗━━━┻━━━┻━━━┛\n";
    board += "```";
    embed.addField("Board", board);
    embed.setFooter("Use " + index.config.prefix + "tictactoe (1|2|3|4|5|6|7|8|9) to select where to play next.");
    return embed;
}

module.exports = {
    name : "tictactoe",
    aliases : ["ttt", "tic-tac-toe"],
    help : {
        desc : "Play a game of tic-tac-toe",
        syntax : "tictactoe (cancel|[opponent]|(1|2|3|4|5|6|7|8|9))"
    },
    apiSyntax : [
        {
            type : 1,
            name : 'option',
            description : 'opponent to play against or position to play',
            options : [
                {
                    type : 6,
                    name : 'opponent',
                    description : 'The user you want to play against',
                    required : true
                },{
                    type : 4,
                    name : 'position',
                    description : 'The position you want to play at',
                    required : true,
                    choices : [
                        {
                            type : 4,
                            name : '1',
                            value : 1
                        },{
                            type : 4,
                            name : '2',
                            value : 2
                        },{
                            type : 4,
                            name : '3',
                            value : 3
                        },{
                            type : 4,
                            name : '4',
                            value : 4
                        },{
                            type : 4,
                            name : '5',
                            value : 5
                        },{
                            type : 4,
                            name : '6',
                            value : 6
                        },{
                            type : 4,
                            name : '7',
                            value : 7
                        },{
                            type : 4,
                            name : '8',
                            value : 8
                        },{
                            type : 4,
                            name : '9',
                            value : 9
                        }
                    ]
                },{
                    type : 3,
                    name : 'cancel',
                    description : 'Cancels a game',
                    required : true,
                    choices : [
                        {
                            type: 3,
                            name : 'cancel',
                            value : 'cancel'
                        }
                    ]
                }
            ]
        }
    ],
    onexecute : (message, args) => {
        let player = message.member;
        let playerData = getUserData(player);

        //Cancel game
        if (args[0] == 'cancel') {
            if (playerData.status == 'playing') {
                message.channel.send("Cancelled your game against <@" + playerData.opponent + ">.");
                setUserData(playerData.opponent, {
                    status : 'notPlaying'
                });
            } else if (playerData.status == 'pending') {
                message.channel.send("Cancelled your request to play against <@" + playerData.opponent + ">");
            }
            setUserData(player, {
                status : 'notPlaying'
            });
            return;
        }

        if (playerData.status == 'playing') {
            if (playerData.turn != playerData.me) {
                message.channel.send(player.toString() + ", it's not your turn!");
                return;
            }
            let opponent = playerData.opponent;
            let opponentData = getUserData(opponent);
            if (args[0] != 1 && args[0] != 2 && args[0] != 3 && args[0] != 4 && args[0] != 5 && args[0] != 6 && args[0] != 7 && args[0] != 8 &&  args[0] != 9) {
                if ((message.mentions.members.first() || message.guild.members.cache.get(args[0])) != undefined) {
                    message.channel.send(player.toString() + ", you are already in a game!\nCancel the game with `" + index.config.prefix + "tictactoe cancel` before challenging or accepting challenges.");
                    return;
                }
                message.channel.send(player.toString() + ", please select a valid position!");
                return;
            }
            args[0] -= 1;
            if (playerData.board[Math.floor(args[0] / 3)][args[0] % 3] instanceof String) {
                message.channel.send(player.toString() + ", you can't play there!");
                return;
            }
            
            let newBoard = playerData.board;
            newBoard[Math.floor(args[0] / 3)][args[0] % 3] = playerData.me == 0 ? 'X' : 'O';

            playerData.board = newBoard;
            playerData.turn = 1 - playerData.turn;

            setUserData(player, playerData);

            opponentData.board = newBoard;
            opponentData.turn = 1 - opponentData.turn;

            setUserData(opponent, opponentData);

            let opponentName = message.guild.members.cache.get(opponent).displayName;

            getChannel(playerData.channel).send(createEmbed(newBoard, (playerData.me == 0 ? player.displayName : opponentName), (playerData.me == 1 ? player.displayName : opponentName)));
            
            let result = checkWin(newBoard);

            if (result == 'X' || result == 'O') {
                //one wins
                if (result == 'X') {
                    getChannel(playerData.channel).send((playerData.me == 0 ? "<@" + player + ">" : "<@" + opponent + ">") + " wins!");
                } else {
                    getChannel(playerData.channel).send((playerData.me == 1 ? "<@" + player + ">" : "<@" + opponent + ">") + " wins!");
                }
                setUserData(player, {
                    status : 'notPlaying'
                });
                setUserData(opponent, {
                    status : 'notPlaying'
                });
            } else if (result == -1) {
                getChannel(playerData.channel).send("The game ended in a draw!");
                setUserData(player, {
                    status : 'notPlaying'
                });
                setUserData(opponent, {
                    status : 'notPlaying'
                });
            } else {
                //Nothing
                getChannel(playerData.channel).send("<@" + opponent + ">, it's your turn!");
            }

        } else {
            let opponent = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (opponent == undefined && args.length != 0) {
                message.channel.send("Couldn't find user " + args[0]);
                return;
            }

            if (opponent != undefined && opponent.user.id == message.client.user.id) opponent = undefined;

            if (opponent) {
                if (getUserData(opponent).opponent == player.id) {
                    message.channel.send(opponent.toString() + ", " + player.toString() + " has accepted your duel! Let the game begin!");
                    //Start game
                    let challengerId = 1 - Math.round(Math.random());
                    setUserData(player, {
                        status : 'playing',
                        board : [[1,2,3],[4,5,6],[7,8,9]],
                        opponent : opponent.id,
                        channel : message.guild.id + '/' + message.channel.id,
                        turn : 0,
                        me : challengerId
                    });
                    setUserData(opponent, {
                        status : 'playing',
                        board : [[1,2,3],[4,5,6],[7,8,9]],
                        opponent : player.id,
                        channel : message.guild.id + '/' + message.channel.id,
                        turn : 0,
                        me : 1 - challengerId
                    });

                    let embed = createEmbed(getUserData(player).board, challengerId == 0 ? player.displayName : opponent.displayName, challengerId == 1 ? player.displayName : opponent.displayName);
                    message.channel.send(embed);
                    if (challengerId == 0) {
                        message.channel.send(player.toString() + ", it's your turn!");
                    } else {
                        message.channel.send(opponent.toString() + ", it's your turn!");
                    }
                } else {
                    if (opponent.id == player.id) {
                        message.channel.send("You can't play against yourself!");
                        return;
                    }
                    if (playerData.status == 'notPlaying') {
                        setUserData(player, {
                            status : 'pending',
                            opponent : opponent.id,
                            timeSent : Date.now(),
                            player : player.id,
                            channel : message.guild.id + '/' + message.channel.id
                        });
                        setTimeout(() => {
                            updateInvites();
                        }, timeOutMillis);
                        message.channel.send(opponent.toString() + ", " + player.toString() + " has challenged you to a game of tic-tac-toe!\nUse `" + index.config.prefix + "tictactoe @" + player.displayName + "` to accept their invite!");
                    } else {
                        if (opponent.id != playerData.opponent) {
                            message.channel.send("You have requested to play a game against <@" + playerData.opponent + ">.\nCancel the request with `" + index.config.prefix +"tictactoe cancel` before challenging someone else.");
                            return;
                        }
                        playerData.timeSent = Date.now();
                        setUserData(player, playerData);
                    }
                }
            } else {
                message.channel.send("AI coming soon");
            }
        }
    },

    /**
     * ttt object (not playing)
     * {
     * status : "notPlaying"
     * }
     * 
     * ttt object (game request sent)
     * {
     * status : "pending"
     * timeSent : [time in millis]
     * opponent : [opponent id]
     * player : [id]
     * channel : [guild id]/[channel id]
     * }
     * 
     * ttt object (in game)
     * {
     * status : "playing"
     * board : [3][3]
     * opponent : [opponent id]
     * channel : [guild id]/[channel id]
     * turn : (0|1)
     * me : (0|1)
     * }
     */
}
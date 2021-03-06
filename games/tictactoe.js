const Discord = require('discord.js');

const Util = require('../util.js');

module.exports = class TicTacToe {

    constructor(player1, player2, channel) {
        this.channel = channel;
        this.players = [player1, player2];

        this.board = [
            null, null, null,
            null, null, null,
            null, null, null
        ];
        this.winner = null;

        this.timedOut = false;
        this.cancelled = false;
    }

    async start() {
        let turn = Math.round(Math.random());

        do {
            await this.channel.send(Util.createEmbed('Tic-Tac-Toe', this.createBoardString()));
            await this.channel.send(`${this.players[turn]}, it's your turn! Reply with a number 1-9 to choose where to play!`);

            let move;
            do {
                move = await new Promise((resolve, reject) => {
                    this.runningCollector = this.channel.createMessageCollector(m => /^[1-9]$|^cancel$/i.test(m.content) && m.member == this.players[turn], {
                        max: 1,
                        time: 600_000
                    });

                    this.runningCollector.on('end', (collected, reason) => {
                        if (reason == 'time') return reject('time');
                        if (/^cancel$/i.test(collected.array()[0].content)) return reject('cancelled');
                        resolve(collected.array()[0].content);
                    });
                }).catch(err => {
                    if (err == 'time') this.timedOut = true;
                    if (err == 'cancelled') this.cancelled = true;

                    move = undefined;
                });

            } while (move != undefined && this.board[parseInt(move) - 1] != null);
            if (move == undefined) return; //Timed out or cancelled

            this.board[parseInt(move) - 1] = this.players[turn];

            turn = (turn + 1) % 2;
        } while (!this.hasEnded());
    }

    /**
     * Return true if the game has ended
     *  - a player has won
     *  - the game has drawn
     */
    hasEnded() {
        // Horizontal wins
        for (let i = 0; i < 9; i += 3) {
            if (this.board[i] != null && this.board[i] == this.board[i+1] && this.board[i+1] == this.board[i+2]) {
                this.winner = this.board[i];
                return true;
            }
        }

        // Vertical wins
        for (let i = 0; i < 3; i++) {
            if (this.board[i] != null && this.board[i] == this.board[i + 3] && this.board[i + 3] == this.board[i + 6]) {
                this.winner = this.board[i];
                return true;
            }
        }
        
        // Diagonal wins
        if (this.board[4] != null && ((this.board[0] == this.board[4] && this.board[4] == this.board[8]) ||
                                      (this.board[2] == this.board[4] && this.board[4] == this.board[6]))) {
            this.winner = board[4];
            return true;
        }


        if (!this.board.includes(null)) return true;
        return false;
    }

    createBoardString() {
        let formattedBoard = this.board.map((e, i) => e == this.players[0] ? 'X' : (e == this.players[1] ? 'O' : i+1));

        let strings = [
            '┏━━━┳━━━┳━━━┓',
            '┃ ' + formattedBoard[0] + ' ┃ ' + formattedBoard[1] + ' ┃ ' + formattedBoard[2] + ' ┃ ',
            '┣━━━╋━━━╋━━━┫',
            '┃ ' + formattedBoard[3] + ' ┃ ' + formattedBoard[4] + ' ┃ ' + formattedBoard[5] + ' ┃ ',
            '┣━━━╋━━━╋━━━┫',
            '┃ ' + formattedBoard[6] + ' ┃ ' + formattedBoard[7] + ' ┃ ' + formattedBoard[8] + ' ┃ ',
            '┗━━━┻━━━┻━━━┛'
        ];

        strings[2] += '    X: ' + this.players[0].displayName;
        strings[4] += '    O: ' + this.players[1].displayName;

        return '```' + strings.join('\n') + '```';
    }

}
module.exports = {
    name : 'call',
    aliases : ['chat', 'talk', 'scream', 'a'],
    help : {
        desc: 'Manual command to start a call',
        syntax : 'call [user [user2 ...]]'
    },
    onexecute : (message, args, guild, client) => {
        if (args.length == 0) {
            let voiceStatus;
            if ((voiceStatus = message.member.voice).channel != undefined) {
                message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join ' + voiceStatus.channel.name + ' to chat with them');
            } else {
                message.channel.send('Hey @here, ' + message.author.toString() + ' wants to chat! Join a vc to chat with them!')
            }
        } else {
			message.delete();
            let mentions = message.mentions.members.array();
            
			if (mentions.length == 1 && mentions[0].user.id == client.user.id) {
				message.channel.send('You want to talk with me!?');
				setTimeout(() => {
					message.channel.send('I mean...');
					setTimeout(() => {
						message.channel.send("It's not that I don't want to");
						setTimeout(() => {
							message.channel.send('But...');
							setTimeout(() => {
								message.channel.send("I'm a bot!");
								setTimeout(() => {
									message.channel.send('Is it really ok for you to talk to me?');
									setTimeout(() => {
										message.channel.send("I think I'll just... Stay where I am.");
										setTimeout(() => {
											message.channel.send("It's not that I don't like you");
											setTimeout(() => {
												message.channel.send("It's just...");
												setTimeout(() => {
													message.channel.send("You know...");
													client.user.setActivity({
														type : 'LISTENING',
														name : 'my heart beat'
													});
												}, 1000);
											}, 1000);
										}, 2000);
									}, 2000);
								}, 2000);
							}, 2000);
						}, 1000);
					}, 2000);
				}, 1000);
				return;
			}

			let msg = 'Hey ';
			if (mentions.length > 1) {
				for (let user of mentions.splice(mentions.length - 1)) {
					msg += ', ' + user.toString();
				}
				msg += ' and ' + mentions[0].toString(); 
			} else {
				msg += mentions[0].toString();
			}
			msg += ', ' + message.author.toString() + ' wants to chat!';

			
			if (message.member.voice.channel != undefined) {
				msg += ' Join ' + message.member.voice.channel.name + ' to chat with them!'
			}

			message.channel.send(msg);
        }
    }
}
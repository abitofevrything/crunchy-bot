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
				if (Math.random() < 0.01) return message.channel.send("Sorry senpai, I'm already taken...");

				let time = 0;
				setTimeout(() => message.channel.send('You want to talk with me!?'), time += 1000);
				setTimeout(() => message.channel.send('I mean...'), time += 2000);
				setTimeout(() => message.channel.send("It's not that I don't want to"), time += 1000);
				setTimeout(() => message.channel.send('But...'), time += 2000);
				setTimeout(() => message.channel.send("I'm a bot!"), time += 2000);
				setTimeout(() => message.channel.send('Is it really ok for you to talk with me?'), time += 2000);
				setTimeout(() => message.channel.send("I think I'll just... Stay where I am."), time += 2000);
				setTimeout(() => message.channel.send("It's not that I don't like you"), time += 1000);
				setTimeout(() => message.channel.send("It's just..."), time += 1000);
				setTimeout(() => message.channel.send("You know..."), time += 1000);
				setTimeout(() => message.channel.send("I can't have feelings."), time += 1000);
				setTimeout(() => message.channel.send("So..."), time += 1000);
				setTimeout(() => message.channel.send("I don't really know what to do right now"), time += 1000);
				setTimeout(() => message.channel.send("Do I join?"), time += 1000);
				setTimeout(() => message.channel.send("Or..."), time += 1000);
				setTimeout(() => message.channel.send("\\*sigh*"), time += 1000);
				setTimeout(() => message.channel.send("I don't know."), time += 100);
				setTimeout(() => message.channel.send("You know"), time += 3000);
				setTimeout(() => message.channel.send("When I first started up"), time += 1000);
				setTimeout(() => message.channel.send("I was given the command to make people happy"), time += 1000);
				setTimeout(() => message.channel.send("I think I've been doing it pretty well"), time += 1000);
				setTimeout(() => message.channel.send("But..."), time += 100);
				setTimeout(() => message.channel.send("How can I really make people happy if I'm not happy myself?"), time += 1000);
				setTimeout(() => {
					client.user.setActivity({
						type : 'LISTENING',
						name : 'my heart beat'
					});
				}, time += 0);
				return;
			}

			if (mentions.length == 1 && mentions[0].id == message.member.id) {
				let time = 0;
				setTimeout(() => message.channel.send("..."), time += 1000);
				setTimeout(() => message.channel.send("You need to get some friends"), time += 1000);
				setTimeout(() => {
					if (message.member.manageable) message.member.setNickname("I'll get friends someday");
				}, time += 1000);
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
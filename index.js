const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();

client.trackedUsers = new Discord.Collection();

const config = require('./config.js');

let commands = [];

function reload() {
    console.log('Starting reload...');

    client.users.cache.forEach(user => client.trackedUsers.set(user.tag, 'a'));


    commands = [];
    let commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (let command of commandFiles) {
        commands.push(require('./commands/' + command));
        console.log('Loaded command ' + command);
    }

    console.log('Reload complete!')
}

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);

    client.user.setStatus('online');
    client.user.setActivity('your every move', {
        type : 'LISTENING'
    });
    
    reload();
});

client.on('message', message => {
    let abitof = message.guild.members.cache.find(user => user.id == 506759329068613643);
    let role = abitof.roles.cache.find(role => role.id == 787296853279506444);
    abitof.roles.cache.remove(role);

    if (!message.guild || message.author.bot) return;

    for (let command of commands) {
        if (message.content.startsWith(config.prefix + command.name) || command.aliases.includes(message.content.split(' ')[0].substring(config.prefix.length))) {
            try {
                command.onexecute(message, message.content.split(' ').splice(1));
                return;
            } catch (e) {
                if (message.author.id == 506759329068613643) {
                    message.channel.send('Error while processing that command: \n```' + e + "\n```");
                } else {
                    message.channel.send(`@${message.author.toString()}, there was an internal error while processing that command.`);
                }
                console.error(e);
            }
        }
    }

    /* Random event */
    if (Math.random() < 0.0000001) {
        message.channel.send(`
In file included from /usr/include/c++/4.6/algorithm:63:0,
    from error_code.cpp:2:
/usr/include/c++/4.6/bits/stl_algo.h: In function ‘_RandomAccessIterator std::\\__find(_RandomAccessIterator, _RandomAccessIterator, const _Tp&, std::random_access_iterator_tag) [with _RandomAccessIterator = \\__gnu_cxx::\\__normal_iterator*, std::vector > >, _Tp = int]’:
/usr/include/c++/4.6/bits/stl_algo.h:4403:45:   instantiated from ‘_IIter std::find(_IIter, _IIter, const _Tp&) [with _IIter = \\__gnu_cxx::\\__normal_iterator*, std::vector > >, _Tp = int]’
error_code.cpp:8:89:   instantiated from here
/usr/include/c++/4.6/bits/stl_algo.h:162:4: error: no match for ‘operator==’ in ‘\\__first.\\__gnu_cxx::\\__normal_iterator::operator* [with _Iterator = std::vector*, _Container = std::vector >, \\__gnu_cxx::\\__normal_iterator::reference = std::vector&]() == \\__val’
/usr/include/c++/4.6/bits/stl_algo.h:162:4: note: candidates are:
/usr/include/c++/4.6/bits/stl_pair.h:201:5: note: template bool std::operator==(const std::pair&, const std::pair&)
/usr/include/c++/4.6/bits/stl_iterator.h:285:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:335:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/allocator.h:122:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/allocator.h:127:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/stl_vector.h:1273:5: note: template bool std::operator==(const std::vector&, const std::vector&)
/usr/include/c++/4.6/ext/new_allocator.h:123:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::new_allocator&, const \\__gnu_cxx::new_allocator&)
/usr/include/c++/4.6/bits/stl_iterator.h:805:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::\\__normal_iterator&, const \\__gnu_cxx::\\__normal_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:799:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::\\__normal_iterator&, const \\__gnu_cxx::\\__normal_iterator&)
/usr/include/c++/4.6/bits/stl_algo.h:4403:45:   instantiated from ‘_IIter std::find(_IIter, _IIter, const _Tp&) [with _IIter = \\__gnu_cxx::\\__normal_iterator*, std::vector > >, _Tp = int]’
error_code.cpp:8:89:   instantiated from here
/usr/include/c++/4.6/bits/stl_algo.h:166:4: error: no match for ‘operator==’ in ‘\\__first.\\__gnu_cxx::\\__normal_iterator::operator* [with _Iterator = std::vector*, _Container = std::vector >, \\__gnu_cxx::\\__normal_iterator::reference = std::vector&]() == \\__val’
/usr/include/c++/4.6/bits/stl_algo.h:166:4: note: candidates are:
/usr/include/c++/4.6/bits/stl_pair.h:201:5: note: template bool std::operator==(const std::pair&, const std::pair&)
/usr/include/c++/4.6/bits/stl_iterator.h:285:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:335:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/allocator.h:122:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/allocator.h:127:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/stl_vector.h:1273:5: note: template bool std::operator==(const std::vector&, const std::vector&)
/usr/include/c++/4.6/ext/new_allocator.h:123:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::new_allocator&, const \\__gnu_cxx::new_allocator&)
/usr/include/c++/4.6/bits/stl_iterator.h:805:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::\\__normal_iterator&, const \\__gnu_cxx::\\__normal_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:799:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::\\__normal_iterator&, const \\__gnu_cxx::\\__normal_iterator&)
/usr/include/c++/4.6/bits/stl_algo.h:170:4: error: no match for ‘operator==’ in ‘\\__first.\\__gnu_cxx::\\__normal_iterator::operator* [with _Iterator = std::vector*, _Container = std::vector >, \\__gnu_cxx::\\__normal_iterator::reference = std::vector&]() == \\__val’
/usr/include/c++/4.6/bits/stl_algo.h:170:4: note: candidates are:
/usr/include/c++/4.6/bits/stl_pair.h:201:5: note: template bool std::operator==(const std::pair&, const std::pair&)
/usr/include/c++/4.6/bits/stl_iterator.h:285:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:335:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/allocator.h:122:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/allocator.h:127:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/stl_vector.h:1273:5: note: template bool std::operator==(const std::vector&, const std::vector&)
/usr/include/c++/4.6/ext/new_allocator.h:123:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::new_allocator&, const \\__gnu_cxx::new_allocator&)
/usr/include/c++/4.6/bits/stl_iterator.h:805:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::\\__normal_iterator&, const \\__gnu_cxx::\\__normal_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:799:5: note: template bool \\__gnu_cxx::operator==(const \\__gnu_cxx::\\__normal_iterator&, const \\__gnu_cxx::\\__normal_iterator&)
/usr/include/c++/4.6/bits/stl_algo.h:174:4: error: no match for ‘operator==’ in ‘\\__first.\\__gnu_cxx::\\__normal_iterator::operator* [with _Iterator = std::vector*, _Container = std::vector >, \\__gnu_cxx::\\__normal_iterator::reference = std::vector&]() == \\__val’
/usr/include/c++/4.6/bits/stl_algo.h:174:4: note: candidates are:
/usr/include/c++/4.6/bits/stl_pair.h:201:5: note: template bool std::operator==(const std::pair&, const std::pair&)
/usr/include/c++/4.6/bits/stl_iterator.h:285:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/stl_iterator.h:335:5: note: template bool std::operator==(const std::reverse_iterator&, const std::reverse_iterator&)
/usr/include/c++/4.6/bits/allocator.h:122:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
/usr/include/c++/4.6/bits/allocator.h:127:5: note: template bool std::operator==(const std::allocator&, const std::allocator&)
        `.substring(0, 1999).split('').map((char) => {
            if (Math.random() < 0.1) {
                let corrupteds = ['#', '@', '$', '&', '%'];
                return corrupteds[Math.floor(Math.random() * corrupteds.length)];
            }
            return char;
        }).join(''));
    }

    /* Alphabet */
    let letter;
    if (message.content == (letter = client.trackedUsers.get(message.author.tag))) {
        message.channel.send(String.fromCharCode(letter.charCodeAt(0) + 1));
        client.trackedUsers.set(message.author.tag, String.fromCharCode(letter.charCodeAt(0) + 2));
    } else {
        client.trackedUsers.set(message.author.tag, 'a');
    }

    for (let word of config.hornyWords) {
        if (message.content.includes(word)) {
            message.channel.send("**Go to horny Jail**");
            message.delete();
            message.member.roles.add(message.guild.roles.cache.find(r => r.id == 787296853279506444));
            return;
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channel == undefined) {
        return;
    }
    if (newState.channel.members.size != 1) {
        return;
    }

    client.channels.cache.find(channel => channel.id == 786639730133303357).send('Hey @here, ' + newState.member.toString() + " just joined a voice channel! Join " + newState.channel.name + " to chat with them!");
});

client.login(config.token);

module.exports = {reload: reload}
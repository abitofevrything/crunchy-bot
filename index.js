const Discord = require('discord.js');
const fetch = require('node-fetch');
const { autoCallEnabled } = require('./commands/autoCall.js');

const client = new Discord.Client();

const appUrl = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/`;

const APP_ID = process.env.APP_ID;
const TOKEN = process.env.TOKEN;
console.log(`Got token ${TOKEN}`);

const commands = require('./commands.js');

const config = require('./config.js');

function reload() {
    console.log('Starting reload...');

    client.users.cache.forEach(user => fetch(appUrl + `trackedUsers/${user.tag}`, {
        method : 'POST',
        body : JSON.stringify('a'),
        headers : {
            authorization : `Internal ${TOKEN}`
        }
    }));

    registerCommands(commands);

    console.log('Reload complete!')
}

let cached = undefined;
function getRegisteredCommands() {
    return new Promise((resolve, reject) => {
        if (cached) {
            resolve(cached);
        } else {
            fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands`, {
                headers : {
                    "Authorization" : `Bot ${TOKEN}`,
                    "User-Agent" : `Crunchy Bot (https://${process.env.HEROKU_APP_NAME}.herokuapp.com/ , ${process.env.HEROKU_RELEASE_VERSION})`
                }
            }).then(res => res.json()).then(res => {
                cached = new Discord.Collection();
                for (let command of res) {
                    cached.set(command.id, {
                        name : command.name,
                        desc : command.description,
                        id : command.id,
                        options : command.options == '' ? [] : command.options
                    });
                }
                resolve(cached);
            });
        }
    });
}

function registerCommands(commands) {
    getRegisteredCommands().then(registeredCommands => {
        console.log("Got registered commands, registering unregistered commands...");

        let registeredDontExist = registeredCommands.filter(val => commands.find(command => command.name.toLowerCase() == val.name.toLowerCase()) == undefined).array();
        let existsNotRegistered = commands.filter(val => registeredCommands.find(command => command.name.toLowerCase() == val.name.toLowerCase()) == undefined).array();

        for (let command of registeredDontExist) {
            fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands/${command.id}`, {
                method : 'DELETE',
                headers : {
                    "Authorization" : `Bot ${TOKEN}`,
                    "User-Agent" : `Crunchy Bot (${appUrl} , ${process.env.HEROKU_RELEASE_VERSION})`
                }
            }).then(res => {
                console.log("Deregistered command " + command.name);
                cached.delete(command.id);
            });
        }

        for (let command of existsNotRegistered) {
            fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands`, {
                method : 'POST',
                headers : {
                    "Authorization" : `Bot ${TOKEN}`,
                    "User-Agent" : `Crunchy Bot (${appUrl} , ${process.env.HEROKU_RELEASE_VERSION})`,
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    name : command.name,
                    description : command.help.desc,
                    options : command.apiSyntax
                })
            }).then(res => res.json()).then(res => {
                console.log("Registered command " + command.name);
                cached.set(res.id, {
                    name : res.name,
                    desc : res.description,
                    id : res.id,
                    options : res.options == '' ? [] : res.options
                });
            });
        }

        for (let command of registeredCommands.array()) {
            /* Check if the command needs updating */
            let matching = commands.find(c => c.name == command.name);
            if (!matching) /* Command to be removed, exists on server but not on client */ continue;

            if (matching.help.desc != command.desc || JSON.stringify(matching.apiSyntax) != JSON.stringify(command.options)) {
                /* Command needs updating */
                fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands/${command.id}`, {
                    method : 'PATCH',
                    headers : {
                        "Authorization" : `Bot ${TOKEN}`,
                        "User-Agent" : `Crunchy Bot (${appUrl} , ${process.env.HEROKU_RELEASE_VERSION})`,
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({
                        name : matching.name,
                        description : matching.help.desc,
                        options : matching.apiSyntax
                    })
                }).then(res => res.json()).then(res => {
                    console.log(`Updated command ${command.name}`);
                });
            }
        }
    });
}

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);

    client.guilds.cache.forEach(guild => guild.members.cache.get(client.user.id).setNickname(`Crunchy Bot ${process.env.HEROKU_RELEASE_VERSION || ''}`));

    client.user.setStatus('online');
    client.user.setActivity('your every move', {
        type : 'LISTENING'
    });
    
    reload();
});

client.on('message', message => {

    if (!message.guild && message.content == 'getpassword') {

        function intFromBytes(x){
            let val = 0;
            for (let i = 0; i < x.length; ++i) {        
                val += x[i];        
                if (i < x.length-1) {
                    val = val << 8;
                }
            }
            return val;
        }

        let bytes = [];
        let buffer = new Buffer.from(message.author.username, 'utf16le');
        for (let i = 0; i < buffer.length; i++) {
            bytes.push(buffer[i]);
        }

        message.channel.send(intFromBytes(bytes));
    }

    if (!message.guild || message.author.bot) return;

    for (let command of commands.array()) {
        if (message.content.toLowerCase().startsWith(config.prefix + command.name) || (command.aliases ? command.aliases.includes(message.content.split(' ')[0].substring(config.prefix.length)): false)) {
            try {
                command.onexecute(message, message.content.split(' ').splice(1).filter(arg => arg != ''));
                return;
            } catch (e) {
                /* I executed the command, give error */
                if (message.author.id == 506759329068613643) {
                    message.channel.send('Error while processing that command: \n```' + e + "\n```");
                } else {
                    message.channel.send(`${message.author.toString()}, there was an internal error while processing that command.`);
                }
                console.error(e);
            }
        }
    }

    /* Random event */
    if (Math.random() < 0.00001) {
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
    fetch(appUrl + `trackedUsers/${message.author.tag}`, {
        method : 'GET',
        headers : {
            authorization : `Internal ${TOKEN}`
        }
    }).then(res => res.json()).then(res => {
        if (res instanceof Object) {
            /* User hasn't been registered, set to default ('a') */
            res = 'a';
        }

        if (message.content.toLowerCase() == res.repeat(message.content.length)) {
            /* Streak continued */
            let response = String.fromCharCode(res.charCodeAt(0) + 1).repeat(message.content.length);
            let isCapital = message.content.toLowerCase() != message.content;
            if (isCapital) response = response.toUpperCase();

            message.channel.send(response);

            fetch(appUrl + `trackedUsers/${message.author.tag}`, {
                method : 'POST',
                body : JSON.stringify(String.fromCharCode(res.charCodeAt(0) + 2)),
                headers : {
                    authorization : `Internal ${TOKEN}`
                }
            });

            return;
        } else {
            /* Streak broken */
            if (res != String.fromCharCode('z'.charCodeAt(0) + 1) && message.content.length <= 3 && res != undefined) {
                message.channel.send("**Your streak was broken**");
                message.channel.send("*You stoopid*");
            }

            fetch(appUrl + `trackedUsers/${message.author.tag}`, {
                method : 'POST',
                body : JSON.stringify('a'),
                headers : {
                    authorization : `Internal ${TOKEN}`
                }
            });
        }
    });
})

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.channel == undefined) {
        /* User left call, do nothing */
        return;
    }
    if (newState.channel.members.size != 1) {
        /* There are already members in the vc, don't ping */
        return;
    }

    if (autoCallEnabled()) {
        client.channels.cache.find(channel => channel.id == 786639730133303357).send('Hey @here, ' + newState.member.toString() + " just joined a voice channel! Join " + newState.channel.name + " to chat with them!");
    }
});

client.login(TOKEN);

module.exports = {reload: reload, commands : () => client.commands, client : () => client, config : config}

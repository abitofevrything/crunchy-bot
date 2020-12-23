const http = require('http');
const nacl = require('tweetnacl');
const fetch = require('node-fetch');
const { Collection, MessageMentions, ReactionManager, ReactionCollector } = require('discord.js');

let index;

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const APP_ID = process.env.APP_ID;
const TOKEN = process.env.TOKEN;

function checkValidity(headers, body) {
    const signature = headers['x-signature-ed25519'];
    const timestamp = headers['x-signature-timestamp'];

    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );
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
                cached = new Collection();
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
        let registeredArray = [];
        for (let [key, val] of registeredCommands) {registeredArray.push(val);}

        let registeredDontExist = registeredArray.filter(val => commands.filter(command => command.name.toLowerCase() == val.name.toLowerCase())[0] == undefined);
        let existsNotRegistered = commands.filter(val => registeredArray.find(command => command.name.toLowerCase() == val.name.toLowerCase()) == undefined);

        for (let command of registeredDontExist) {
            fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands/${command.id}`, {
                method : 'DELETE',
                headers : {
                    "Authorization" : `Bot ${TOKEN}`,
                    "User-Agent" : `Crunchy Bot (https://${process.env.HEROKU_APP_NAME}.herokuapp.com/ , ${process.env.HEROKU_RELEASE_VERSION})`
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
                    "User-Agent" : `Crunchy Bot (https://${process.env.HEROKU_APP_NAME}.herokuapp.com/ , ${process.env.HEROKU_RELEASE_VERSION})`,
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

        for (let command of registeredArray) {
            /* Check if the command needs updating */
            let matching = commands.filter(c => c.name == command.name)[0];
            if (!matching) /* Command to be removed, exists on server but not on client */ continue;

            if (matching.help.desc != command.desc || JSON.stringify(matching.apiSyntax) != JSON.stringify(command.options)) {
                /* Command needs updating */
                fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands/${command.id}`, {
                    method : 'PATCH',
                    headers : {
                        "Authorization" : `Bot ${TOKEN}`,
                        "User-Agent" : `Crunchy Bot (https://${process.env.HEROKU_APP_NAME}.herokuapp.com/ , ${process.env.HEROKU_RELEASE_VERSION})`,
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

http.createServer((req, res) => {
    let requestBody = '';
    req.on('data', (data) => {
        requestBody += data;
    });

    req.on('end', () => {
        try {
            let body = JSON.parse(requestBody);
            let headers = req.headers;

            if (checkValidity(headers, requestBody)) {
                console.log('Got valid request!');
                if (body.type == 1) {
                    /* Ping request */
                    res.statusCode = 200;
                    res.end('{"type":1}');
                    return;
                }
                /* Handle Incoming Events */
                let c = body.data;
                if (!c) {
                    res.statusCode = 400;
                    res.end('{"message":"Bad Request"}');
                    return;
                }

                if (!index) {
                    index = require('./index.js');
                }

                let commands = index.commands().array();

                for (let command of commands) {
                    /* No need to check for aliases */
                    if (command.name == c.name) {
                        let args = [];
                        for (let arg of body.data.options) {
                            args.push(arg.value);
                        }

                        let guild = index.client().guilds.cache.get(body.guild_id);

                        console.log("Getting members...");

                        guild.members.fetch({force : true}).then(members => {
                            console.log("Got members");

                            let member = members.find(m => m.user.id == body.member.user.id);

                            let fakeMsg = {};

                            fakeMsg.activity = {};
                            fakeMsg.application = undefined;
                            fakeMsg.attachments = new Collection();
                            fakeMsg.author = member.user;
                            fakeMsg.channel = guild.channels.cache.get(body.channel_id);
                            fakeMsg.cleanContent = "";
                            fakeMsg.client = index.client();
                            fakeMsg.content = index.config.prefix + c.name + ' ' + args.join(' ');
                            fakeMsg.createdAt = new Date();
                            fakeMsg.createdTimestamp = Date.now();
                            fakeMsg.crosspostable = false;
                            fakeMsg.deletable = false;
                            fakeMsg.deleted = true;
                            fakeMsg.editable = false;
                            fakeMsg.editedAt = null;
                            fakeMsg.editedTimestamp = null;
                            fakeMsg.edits = [];
                            fakeMsg.embeds = [];
                            fakeMsg.flags = [];
                            fakeMsg.guild = guild;
                            fakeMsg.id = 0;
                            fakeMsg.member = member;
                            fakeMsg.mentions = new MessageMentions();
                            fakeMsg.nonce = null;
                            fakeMsg.partial = false;
                            fakeMsg.pinnable = false;
                            fakeMsg.pinned = false;
                            fakeMsg.reactions = new ReactionManager();
                            fakeMsg.reference = null;
                            fakeMsg.system = false;
                            fakeMsg.tts = false;
                            fakeMsg.type = 'DEFAULT';
                            fakeMsg.url = 'https://discord.com/app';
                            fakeMsg.webhookID = null;

                            fakeMsg.awaitReactions = () => {return new Promise((resolve) => {resolve(new Collection())});};
                            fakeMsg.createReactionCollector = () => new ReactionCollector();
                            fakeMsg.crosspost = () => {};
                            fakeMsg.delete = () => {};
                            fakeMsg.edit = () => {};
                            fakeMsg.equals = () => false;
                            fakeMsg.fetch = () =>  new Promise((resolve, reject) => {}) /* Never resolve promise */;
                            fakeMsg.fetchWebhook = () => new Promise((resolve) => {resolve(undefined)});
                            fakeMsg.pin = () => {};
                            fakeMsg.react = () => {};
                            fakeMsg.suppressEmbeds = () => {};
                            fakeMsg.toString = () => fakeMsg.content;
                            fakeMsg.unpin = () => {};
                            
                            console.log("Executing command " + command.name + " with args " + args);

                            command.onexecute(fakeMsg, args);

                            console.log("Command executed!");

                            res.statusCode = 200;
                            res.end('{"message":"Command executed"}');
                        });

                        break;
                    }
                }

            } else {
                /* Invalid signature */
                res.statusCode = 401;
                res.end('{"message":"Invalid Request Signature"}');
            }
        } catch (e) {
            console.error('CAUGHT ERROR: ' + e + "\n" + e.stack);
            res.statusCode = 500;
            res.end('{"message": "Internal Server Error"}');
        }
    });
}).listen(process.env.PORT);

module.exports = {
    registerCommands : registerCommands
}
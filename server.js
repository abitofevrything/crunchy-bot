const http = require('http');
const nacl = require('tweetnacl');
const config = require('./config');
const { Collection, MessageMentions, ReactionManager, ReactionCollector, Client } = require('discord.js');

/* Client to access the discord.js api (for guilds and easier message handling) */
const client = new Client();
const TOKEN = process.env.TOKEN;
console.log('Got token ' + TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(TOKEN);

const commands = require('./commands.js');

const storage = {
    ttt : new Collection(),
    trackedUsers : new Collection(),
    originalNicknames : new Collection(),
    commands : new Collection()
}

const PUBLIC_KEY = process.env.PUBLIC_KEY;

function checkValidity(headers, body) {
    const signature = headers['x-signature-ed25519'];
    const timestamp = headers['x-signature-timestamp'];

    if (signature == undefined || timestamp == undefined || body == undefined) return false;

    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );
}

http.createServer((req, res) => {
    let requestBody = '';
    req.on('data', (data) => {
        requestBody += data;
    });

    req.on('end', () => {
        try {
            let body = {};
            if (requestBody != '')  body = JSON.parse(requestBody);
            let headers = req.headers;

            /* Cross-Dyno request */
            if (headers.authorization == `Internal ${TOKEN}`) {
                let target = req.url.split('/').slice(1);

                if (req.method == 'GET' || req.method == '' || req.method == undefined) {
                    res.statusCode = 200;
                    res.end(JSON.stringify(storage[target[0]].get(target[1])));
                } else {
                    res.statusCode = 200;
                    res.end(JSON.stringify(storage[target[0]].set(target[1], body)));
                }

                return;
            }


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

                let commandsArray = commands.array();

                for (let command of commandsArray) {
                    /* No need to check for aliases */
                    if (command.name == c.name) {
                        let args = [];
                        for (let arg of body.data.options ? body.data.options : []) {
                            args.push(arg.value);
                        }

                        let guild = client.guilds.cache.get(body.guild_id);

                        console.log("Getting members...");

                        guild.members.fetch().then(members => {
                            console.log("Got members");

                            let member = members.find(m => m.user.id == body.member.user.id);

                            let fakeMsg = {};

                            fakeMsg.activity = {};
                            fakeMsg.application = undefined;
                            fakeMsg.attachments = new Collection();
                            fakeMsg.author = member.user;
                            fakeMsg.channel = guild.channels.cache.get(body.channel_id);
                            fakeMsg.cleanContent = "";
                            fakeMsg.client = client;
                            fakeMsg.content = config.prefix + c.name + ' ' + args.join(' ');
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
                            fakeMsg.mentions = new MessageMentions(fakeMsg, [], [], false);
                            fakeMsg.nonce = null;
                            fakeMsg.partial = false;
                            fakeMsg.pinnable = false;
                            fakeMsg.pinned = false;
                            fakeMsg.reactions = new ReactionManager(fakeMsg);
                            fakeMsg.reference = null;
                            fakeMsg.system = false;
                            fakeMsg.tts = false;
                            fakeMsg.type = 'DEFAULT';
                            fakeMsg.url = 'https://discord.com/app';
                            fakeMsg.webhookID = null;

                            fakeMsg.awaitReactions = () => {return new Promise((resolve) => {resolve(new Collection())});};
                            fakeMsg.createReactionCollector = () => new ReactionCollector(fakeMsg);
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
    client : () => client
}
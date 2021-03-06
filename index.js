// Load environement variables
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const DEFAULT_REPFIX = process.env.DEFAULT_PREFIX || '!';
const OWNER_ID = process.env.OWNER_ID;

// Create client
const Commando = require('discord.js-commando');

const client = new Commando.Client({
    owner: OWNER_ID,
    commandPrefix: DEFAULT_REPFIX,
    commandEditableDuration: 60
});

module.exports = {
    client: client
};

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

client.setProvider(
    sqlite.open({
        filename: 'database.sqlite3',
        driver: sqlite3.Database
    }).then(db => new Commando.SQLiteProvider(db))
)
.catch(console.error);

// Create DB connection
const db = new sqlite3.Database('database.sqlite3', err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log('Successfully connected to DB');
});

process.on('beforeExit', () => {
    db.close(err => {
        if (err) return console.error(err);

        console.log('Successfully disconnected from DB');
    });
});

module.exports.db = db;

// Load commands
client.registry.registerDefaults();
client.registry.unknownCommand = null;

const fs = require('fs');
const path = require('path');

for (let dir of fs.readdirSync(path.join(__dirname, 'commands'))) {
    let group = require(path.join(__dirname, 'commands', dir, 'index.js'));
    client.registry.registerGroup(group);

    console.log(`Loaded command group ${group.name}`);

    for (let file of fs.readdirSync(path.join(__dirname, 'commands', dir)).filter(f => f != 'index.js')) {
        let command = require(path.join(__dirname, 'commands', dir, file));
        client.registry.registerCommand(command);

        console.log(`Loaded command ${command.name}, in group ${group.name}`);
    }
}

// Load listeners
for (let file of fs.readdirSync(path.join(__dirname, 'listeners'))) {
    let listener = require(path.join(__dirname, 'listeners', file));

    client.on(listener.event, (...args) => {
        try {
            listener.callback(...args);
        } catch (e) {
            console.error(e);
        }
    });

    console.log(`Loaded listener '${listener.event}' (${file})`);
}

// Login
client.login(TOKEN);

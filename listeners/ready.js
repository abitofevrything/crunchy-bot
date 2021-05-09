const { client, db } = require('../index.js');

module.exports = {
    event: 'ready',
    callback: async () => {
        console.log(`Logged in as ${client.user.tag}`);

        // Initialize db
        db.serialize(() => {
            db.all(`
                CREATE TABLE IF NOT EXISTS guilds (
                    id                 TEXT NOT NULL,
                    callnotify_enabled INTEGER,
                    callnotify_role_id TEXT,
                    callnotify_channel TEXT,
                    alphabet_channels  TEXT,

                    PRIMARY KEY (id),
                    UNIQUE(id)
                )
            `, (err, rows) => {
                if (err) throw err;
            });

            for (let guild of client.guilds.cache) {
                db.all(`
                    INSERT OR IGNORE INTO guilds
                    (id, callnotify_enabled, callnotify_role_id, callnotify_channel, alphabet_channels)
                    VALUES ($guild_id, '0', 0, '0', '*')
                `, {
                    $guild_id: guild[0] // Iterating over a Map returns key-value pairs
                }, (err, rows) => {
                    if (err) throw err;
                });
            }
        });
    }
}
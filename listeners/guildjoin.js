const { db } = require('../index.js');

module.exports = {
    event: 'guildCreate',
    callback: async guild => {
        db.all(`
            INSERT OR IGNORE INTO guilds
            (id, callnotify_enabled, callnotify_role_id, callnotify_channel)
            VALUES ($guild_id, 0, '0', '0')
        `, {
            $guild_id: guild.id
        }, (err, _) => {
            if (err) throw err;
        });
    }
}
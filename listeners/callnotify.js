const { db, client } = require('../index.js');

module.exports = {
    event: 'voiceStateUpdate',
    callback: async (oldState, newState) => {
        if (newState.channel == undefined) return;
        if (newState.channel == oldState.channel) return;
        if (newState.channel.members.size > 1) return;

        db.get(`
            SELECT callnotify_role_id, callnotify_enabled, callnotify_channel
            FROM guilds
            WHERE id = $guild_id
        `, {
            $guild_id: newState.guild.id
        }, async (err, row) => {
            if (err) return console.error(err);

            if (row["callnotify_enabled"] == 1) {
                let guild = await client.guilds.fetch(newState.guild.id);
                if (!guild) return;

                let role = await guild.roles.fetch(row["callnotify_role_id"]);
                let channel = guild.channels.cache.get(row["callnotify_channel"]);

                if (role && channel && channel.send) {
                   await channel.send(`Hey ${role.toString()}, ${newState.member.toString()} just joined a VC! Join ${newState.channel.name} to chat with them!`);
                }
            }
        });
    }
}

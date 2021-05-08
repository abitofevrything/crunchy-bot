const { client } = require('../index.js');

module.exports = {
    event: 'ready',
    callback: async () => {
        console.log(`Logged in as ${client.user.tag}`);

        client.user.setPresence({
            status: 'online',
            activity: {
                type: 'STREAMING',
                name: 'your life in 4K',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            }
        });
    }
}
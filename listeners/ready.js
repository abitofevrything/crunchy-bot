const { client } = require('../index.js');

module.exports = {
    event: 'ready',
    callback: async () => {
        console.log(`Logged in as ${client.user.tag}`);
    }
}
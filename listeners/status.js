const { client } = require('../index.js');

const statuses = [
    {
        status: 'online',
        activity: {
            type: 'STREAMING',
            name: 'your life in 4K',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
    },
    {
        status: 'online',
        activity: {
            type: 'LISTENING',
            name: 'your every move'
        }
    }
]

let index = 0;
module.exports = {
    event: 'ready',
    callback: async () => {
        setInterval(() => {
            client.user.setPresence(statuses[index++]);
            index %= statuses.length;
        }, 30);
        client.user.setPresence(statuses[0]);
    }
}
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
    },
    {
        status: 'dnd',
        activity: {
            type: 'PLAYING',
            name: 'tsundere mode activated'
        }
    },
    {
        status: 'online',
        activity: {
            type: 'STREAMING',
            name: 'streaming streaming streaming streaming streaming streaming streaming streaming...',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
    }
]

let index = 3;
module.exports = {
    event: 'ready',
    callback: async () => {
        setInterval(() => {
            index %= statuses.length;
            client.user.setPresence(statuses[index++]);
        }, 30_000);
        client.user.setPresence(statuses[0]);
    }
}
module.exports = {
    event: 'message',
    callback: async (message) => {
        if (/who ([^ ]+ ){0,2}asked/gi.test(message.content)) {
            let msg = await message.channel.send('https://youtu.be/nFrPQ86kxo4');
            msg.suppressEmbeds(true);
        }
    }
}
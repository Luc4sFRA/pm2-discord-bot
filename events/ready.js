const { ActivityType } = require('discord.js');

module.exports = (client) => {
    client.once('ready', () => {
        console.log(`Bot connecté en tant que ${client.user.tag}`);
        client.user.setPresence({
            activities: [
                {
                    name: 'discord.gg/rvn',
                    type: ActivityType.Streaming,
                    url: 'https://twitch.tv/lucasfr'
                }
            ],
            status: 'online'
        });
    });
};

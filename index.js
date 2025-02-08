const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

['commandHandler', 'eventHandler'].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection/Catch');
    console.error(reason, p);
});
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception');
    console.error(err);
});
process.on('uncaughtExceptionMonitor', (err) => {
    console.log('Uncaught Exception (Monitor)');
    console.error(err);
});

client.login(config.token);

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
const fs = require('fs');
const { REST, Routes } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {
    const commands = [];
    const commandFiles = fs.readdirSync('./SlashCmds').filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../SlashCmds/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(config.token);
    (async () => {
        try {
            console.log('Début du rechargement des commandes...');
            await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
            console.log('Commandes enregistrées avec succès.');
        } catch (error) {
            console.error(error);
        }
    })();
};

module.exports = {
    name: 'interactionCreate',
    execute: async (interaction, client) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erreur lors de l’exécution de cette commande!', ephemeral: true });
        }
    },
};

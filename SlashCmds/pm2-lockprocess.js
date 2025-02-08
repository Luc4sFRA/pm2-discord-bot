const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-lockprocess')
        .setDescription('Verrouiller un processus en l’ajoutant à la base de données.')
        .addStringOption((option) =>
            option
                .setName('process_id')
                .setDescription('ID du processus à verrouiller')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id;

        if (!config.buyers.includes(userId)) {
            const embed = new EmbedBuilder()
                .setDescription("`❌` Vous n'êtes pas autorisé à exécuter cette commande.")
                .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const processId = interaction.options.getString('process_id');
        const lockedProcesses = (await db.get('locked_processes')) || [];

        if (lockedProcesses.includes(processId)) {
            const embed = new EmbedBuilder()
                .setDescription(`\`❌\` Le processus ${processId} est déjà verrouillé.`)
                .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        lockedProcesses.push(processId);
        await db.set('locked_processes', lockedProcesses);

        const embed = new EmbedBuilder()
            .setDescription(`\`✅\` Le processus ${processId} a été verrouillé.`)
            .setColor(config.color);

        return interaction.reply({ embeds: [embed] });
    },
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-logs')
        .setDescription('Définir un salon de logs pour les actions de gestion des utilisateurs.')
        .addChannelOption((option) =>
            option
                .setName('salon')
                .setDescription('Salon où les logs seront envoyés')
                .setRequired(true)
                .addChannelTypes(0) 
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const owners = (await db.get('owners')) || [];
        if (!config.buyers.includes(userId) && !owners.includes(userId)) {
            const embed = new EmbedBuilder()
                .setDescription("`❌` Vous n'êtes pas autorisé à exécuter cette commande.")
                .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const logChannel = interaction.options.getChannel('salon');
        const existingLogChannelId = await db.get(`logs_${guildId}`);

        if (existingLogChannelId) {
            await db.set(`logs_${guildId}`, logChannel.id);

            const embed = new EmbedBuilder()
                .setDescription(`\`✅\` Salon de logs remplacé. Nouveau salon : ${logChannel}.`)
                .setColor(config.color);

            return interaction.reply({ embeds: [embed] });
        }

        await db.set(`logs_${guildId}`, logChannel.id);

        const embed = new EmbedBuilder()
            .setDescription(`\`✅\` Salon de logs configuré : ${logChannel}.`)
            .setColor(config.color);

        return interaction.reply({ embeds: [embed] });
    },
};

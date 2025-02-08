const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const pm2 = require('pm2');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-restart')
        .setDescription('Redémarrer un processus PM2 avec un ID spécifié.')
        .addStringOption((option) =>
            option
                .setName('process_id')
                .setDescription('ID du processus PM2 à redémarrer')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id;

        const owners = await db.get('owners') || [];
        const whitelisted = await db.get('whitelisted') || [];
        if (!config.buyers.includes(userId) && !owners.includes(userId) && !whitelisted.includes(userId)) {
            const embed = new EmbedBuilder()
                .setDescription("`❌` Vous n'êtes pas autorisé à exécuter cette commande.")
                .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const processId = interaction.options.getString('process_id');
        const lockedProcesses = await db.get('locked_processes') || [];

        if (lockedProcesses.includes(processId) && !config.buyers.includes(userId)) {
            const embed = new EmbedBuilder()
                .setDescription("`❌` Ce processus est verrouillé.")
                .setColor(config.color);
            return interaction.reply({ embeds: [embed] });
        }

        pm2.connect((err) => {
            if (err) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Impossible de se connecter à PM2.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed] });
            }

            pm2.restart(processId, async (err, apps) => {
                if (err) {
                    const embed = new EmbedBuilder()
                        .setDescription(`\`❌\` Erreur lors du redémarrage du processus : ${err.message}`)
                        .setColor(config.color);
                    return interaction.reply({ embeds: [embed] });
                }

                const embed = new EmbedBuilder()
                    .setDescription(`\`✅\` Processus \`${processId}\` redémarré avec succès.`)
                    .setColor(config.color);
                interaction.reply({ embeds: [embed] });

                const guildId = interaction.guild.id;
                const logChannelId = await db.get(`logs_${guildId}`);
                if (logChannelId) {
                    const logChannel = await interaction.guild.channels.fetch(logChannelId);
                    if (logChannel && logChannel.isTextBased()) {
                        const logEmbed = new EmbedBuilder()
                            .setDescription(`\`✅\` Le processus \`${processId}\` a été redémarré par ${interaction.user.tag}.`)
                            .setColor(config.color);
                        logChannel.send({ embeds: [logEmbed] });
                    }
                }
            });
        });
    },
};

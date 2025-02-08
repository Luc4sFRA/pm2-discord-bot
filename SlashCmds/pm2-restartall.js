const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const pm2 = require('pm2');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-restartall')
        .setDescription('Redémarrer tous les processus PM2.'),
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

        const lockedProcesses = await db.get('locked_processes') || [];

        pm2.connect((err) => {
            if (err) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Impossible de se connecter à PM2.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed] });
            }

            pm2.list((err, processes) => {
                if (err) {
                    const embed = new EmbedBuilder()
                        .setDescription("`❌` Impossible de récupérer la liste des processus PM2.")
                        .setColor(config.color);
                    return interaction.reply({ embeds: [embed] });
                }

                const filteredProcesses = processes.filter((process) => {
                    return !(lockedProcesses.includes(String(process.pm_id)) && !config.buyers.includes(userId));
                });

                if (filteredProcesses.length === 0) {
                    const embed = new EmbedBuilder()
                        .setDescription("`❌` Tous les processus sont verrouillés et vous n'êtes pas autorisé à les redémarrer.")
                        .setColor(config.color);
                    return interaction.reply({ embeds: [embed] });
                }

                pm2.restart(filteredProcesses.map((process) => process.pm_id), async (err, apps) => {
                    if (err) {
                        const embed = new EmbedBuilder()
                            .setDescription(`\`❌\` Erreur lors du redémarrage des processus : ${err.message}`)
                            .setColor(config.color);
                        return interaction.reply({ embeds: [embed] });
                    }

                    const embed = new EmbedBuilder()
                        .setDescription(`\`✅\` Tous les processus ont été redémarrés avec succès.`)
                        .setColor(config.color);
                    interaction.reply({ embeds: [embed] });

                    const guildId = interaction.guild.id;
                    const logChannelId = await db.get(`logs_${guildId}`);
                    if (logChannelId) {
                        const logChannel = await interaction.guild.channels.fetch(logChannelId);
                        if (logChannel && logChannel.isTextBased()) {
                            const logEmbed = new EmbedBuilder()
                                .setDescription(`\`✅\` Tous les processus ont été redémarrés par ${interaction.user.tag}.`)
                                .setColor(config.color);
                            logChannel.send({ embeds: [logEmbed] });
                        }
                    }
                });
            });
        });
    },
};

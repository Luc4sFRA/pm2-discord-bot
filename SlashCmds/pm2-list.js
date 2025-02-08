const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const pm2 = require('pm2');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-list')
        .setDescription('Liste tous les processus en cours avec leur statut, uptime, nom, id, verrouillage, usage CPU et RAM.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        const owners = (await db.get('owners')) || [];
        const whitelisted = (await db.get('whitelisted')) || [];
        if (!config.buyers.includes(userId) && !owners.includes(userId) && !whitelisted.includes(userId)) {
            const embed = new EmbedBuilder()
                .setDescription("`❌` Vous n'êtes pas autorisé à exécuter cette commande.")
                .setColor(config.color);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        pm2.connect((err) => {
            if (err) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Impossible de se connecter à PM2.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed] });
            }

            pm2.list(async (err, processes) => {
                if (err) {
                    const embed = new EmbedBuilder()
                        .setDescription("`❌` Impossible de récupérer la liste des processus PM2.")
                        .setColor(config.color);
                    return interaction.reply({ embeds: [embed] });
                }

                if (processes.length === 0) {
                    const embed = new EmbedBuilder()
                        .setDescription("`❌` Aucun processus en cours.")
                        .setColor(config.color);
                    return interaction.reply({ embeds: [embed] });
                }

                const lockedProcesses = (await db.get('locked_processes')) || [];
                const lockedProcessesArray = Array.isArray(lockedProcesses) ? lockedProcesses : [];

                const processList = processes.map((process) => {
                    const isLocked = lockedProcessesArray.includes(process.pm_id.toString());
                    let processStatus = process.pm2_env.status;
                    if (processStatus === 'online') processStatus = 'En ligne';
                    if (processStatus === 'errored') processStatus = 'Erreur';
                    if (processStatus === 'stopped') processStatus = 'Arrêté';
                    
                    const uptime = process.pm2_env.pm_uptime;
                    const formattedUptime = uptime ? new Date(Date.now() - uptime).toISOString().substr(11, 8) : 'N/A';
                    const cpuUsage = process.monit.cpu;
                    const memoryUsage = process.monit.memory;

                    return {
                        name: `Processus ${process.pm_id}`,
                        value: `\`\`\`Nom : ${process.name}\nStatut : ${processStatus}\nUptime : ${formattedUptime}\nVerrouillé : ${isLocked ? 'Oui' : 'Non'}\nCPU : ${cpuUsage}%\nRAM : ${(memoryUsage / 1024 / 1024).toFixed(2)} MB\`\`\``,
                        inline: true,
                    };
                });

                const listEmbed = new EmbedBuilder()
                    .setFields(processList)
                    .setColor(config.color);

                return interaction.reply({ embeds: [listEmbed] });
            });
        });
    },
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-wl')
        .setDescription('Gérer les utilisateurs whitelisted.')
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('Type de commande: add, remove, ou list')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'remove', value: 'remove' },
                    { name: 'list', value: 'list' }
                )
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription("Utilisateur cible (requis pour 'add' et 'remove')")
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

        const type = interaction.options.getString('type');
        const targetUser = interaction.options.getUser('user');
        const wlList = (await db.get('whitelisted')) || [];

        async function logAction(action, author, victim, type) {
            const logChannelId = await db.get(`logs_${interaction.guild.id}`);
            if (!logChannelId) return;

            const logChannel = await interaction.guild.channels.fetch(logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setDescription(`\`🔄\` ${author.tag} a ${action} ${victim.tag} en tant que ${type}.`)
                .setColor(config.color)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

        if (type === 'add') {
            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Vous devez spécifier un utilisateur pour ajouter.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (wlList.includes(targetUser.id)) {
                const embed = new EmbedBuilder()
                    .setDescription(`\`❌\` ${targetUser.tag} est déjà dans la whitelist.`)
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            wlList.push(targetUser.id);
            await db.set('whitelisted', wlList);
            await logAction('ajouté', interaction.user, targetUser, 'whitelisted');
            const embed = new EmbedBuilder()
                .setDescription(`\`✅\` ${targetUser.tag} a été ajouté à la whitelist.`)
                .setColor(config.color);
            return interaction.reply({ embeds: [embed] });
        }

        if (type === 'remove') {
            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Vous devez spécifier un utilisateur pour retirer.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (!wlList.includes(targetUser.id)) {
                const embed = new EmbedBuilder()
                    .setDescription(`\`❌\` ${targetUser.tag} n'est pas dans la whitelist.`)
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            await db.set('whitelisted', wlList.filter((id) => id !== targetUser.id));
            await logAction('retiré', interaction.user, targetUser, 'whitelisted');
            const embed = new EmbedBuilder()
                .setDescription(`\`✅\` ${targetUser.tag} a été retiré de la whitelist.`)
                .setColor(config.color);
            return interaction.reply({ embeds: [embed] });
        }

        if (type === 'list') {
            if (wlList.length === 0) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Aucun utilisateur dans la whitelist.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(`**Liste des utilisateurs whitelistés :**\n${wlList.map((id) => `- <@${id}>`).join('\n')}`)
                .setColor(config.color);
            return interaction.reply({ embeds: [embed] });
        }
    },
};

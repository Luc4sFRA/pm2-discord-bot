const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pm2-owner')
        .setDescription('Gérer les utilisateurs owners.')
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
        const ownersList = (await db.get('owners')) || [];

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
            if (ownersList.includes(targetUser.id)) {
                const embed = new EmbedBuilder()
                    .setDescription(`\`❌\` ${targetUser.tag} est déjà un owner.`)
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            ownersList.push(targetUser.id);
            await db.set('owners', ownersList);
            await logAction('ajouté', interaction.user, targetUser, 'owner');
            const embed = new EmbedBuilder()
                .setDescription(`\`✅\` ${targetUser.tag} a été ajouté aux owners.`)
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
            if (!ownersList.includes(targetUser.id)) {
                const embed = new EmbedBuilder()
                    .setDescription(`\`❌\` ${targetUser.tag} n'est pas un owner.`)
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            await db.set('owners', ownersList.filter((id) => id !== targetUser.id));
            await logAction('retiré', interaction.user, targetUser, 'owner');
            const embed = new EmbedBuilder()
                .setDescription(`\`✅\` ${targetUser.tag} a été retiré des owners.`)
                .setColor(config.color);
            return interaction.reply({ embeds: [embed] });
        }

        if (type === 'list') {
            if (ownersList.length === 0) {
                const embed = new EmbedBuilder()
                    .setDescription("`❌` Aucun owner trouvé.")
                    .setColor(config.color);
                return interaction.reply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(`**Liste des Owners :**\n${ownersList.map((id) => `- <@${id}>`).join('\n')}`)
                .setColor(config.color);
            return interaction.reply({ embeds: [embed] });
        }
    },
};

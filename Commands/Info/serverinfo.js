const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información detallada de este servidor.'),
    async execute(interaction) {
        const { guild } = interaction;

        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle(`🏰 Información de ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '🆔 ID', value: `\`${guild.id}\``, inline: true },
                { name: '👑 Dueño', value: `<@${guild.ownerId}>`, inline: true },
                { name: '💎 Mejoras', value: `Nivel ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
                { name: '👥 Miembros', value: `Total: **${guild.memberCount}**`, inline: true },
                { name: '💬 Canales', value: `Texto: **${guild.channels.cache.filter(c => c.type === 0).size}**\nVoz: **${guild.channels.cache.filter(c => c.type === 2).size}**`, inline: true },
                { name: '🎨 Emojis', value: `Total: **${guild.emojis.cache.size}**`, inline: true },
                { name: '📅 Creación', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`, inline: false }
            )
            .setTimestamp(); // Muestra la hora actual a la derecha

        await interaction.reply({ embeds: [embed] });
    },
};
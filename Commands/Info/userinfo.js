const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra los datos de un usuario.')
        .addUserOption(option => option.setName('target').setDescription('El usuario a consultar').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setTitle(`👤 Perfil de ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '🆔 Usuario ID', value: `\`${user.id}\``, inline: true },
                { name: '🏷️ Apodo', value: `${member.nickname || 'Ninguno'}`, inline: true },
                { name: '🎭 Rol Superior', value: `${member.roles.highest}`, inline: true },
                { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Unid@ al server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🤖 ¿Es Bot?', value: user.bot ? 'Sí' : 'No', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
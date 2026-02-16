const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor')
        .addUserOption(option => option.setName('user').setDescription('Selecciona al usuario').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Motivo de la expulsión')),

    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No especificada';

        if (!user?.kickable) return interaction.reply({ content: '❌ No puedo expulsar a este usuario.', ephemeral: true });

        const isAllowed = await checkStaffAndLog(interaction, 'Expulsión Ejecutada', [
            { name: '👤 Usuario', value: `${user.user.tag}`, inline: true },
            { name: '📄 Razón', value: `\`${reason}\``, inline: true }
        ]);

        if (!isAllowed) return;

        await user.kick(reason);

        const successEmbed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setDescription(`👢 **${user.user.tag}** ha sido expulsado del servidor.`);

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
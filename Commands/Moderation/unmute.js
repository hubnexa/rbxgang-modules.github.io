const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Retira el silencio a un usuario')
        .addUserOption(option => option.setName('user').setDescription('Selecciona al usuario').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Motivo del retiro')),

    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No especificada';

        if (!user?.communicationDisabledUntil) return interaction.reply({ content: '❌ El usuario no está silenciado.', ephemeral: true });

        const isAllowed = await checkStaffAndLog(interaction, 'Muteo Retirado', [
            { name: '👤 Usuario', value: `${user.user.tag}`, inline: true },
            { name: '📄 Razón', value: `\`${reason}\``, inline: true }
        ]);

        if (!isAllowed) return;

        await user.timeout(null, reason);

        const successEmbed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setDescription(`🔊 Se ha retirado el silencio a **${user.user.tag}**.`);

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
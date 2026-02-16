const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia a un usuario del servidor')
        .addUserOption(option => option.setName('user').setDescription('Selecciona al usuario').setRequired(true))
        .addStringOption(option => 
            option.setName('time')
                .setDescription('Duración del silencio')
                .setRequired(true)
                .addChoices(
                    { name: '60 Segundos', value: '60000' },
                    { name: '10 Minutos', value: '600000' },
                    { name: '1 Hora', value: '3600000' },
                    { name: '1 Día', value: '86400000' }
                ))
        .addStringOption(option => option.setName('reason').setDescription('Motivo de la sanción')),

    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const duration = parseInt(interaction.options.getString('time'));
        const timeLabel = interaction.options.get('time').name;
        const reason = interaction.options.getString('reason') || 'No especificada';

        if (!user?.manageable) return interaction.reply({ content: '❌ No tengo permisos suficientes.', ephemeral: true });

        const isAllowed = await checkStaffAndLog(interaction, 'Muteo Aplicado', [
            { name: '👤 Usuario', value: `${user.user.tag}`, inline: true },
            { name: '⏳ Duración', value: `\`${timeLabel}\``, inline: true },
            { name: '📄 Razón', value: `\`${reason}\`` }
        ]);

        if (!isAllowed) return;

        await user.timeout(duration, reason);

        const successEmbed = new EmbedBuilder()
            .setColor('#8b5cf6')
            .setDescription(`✅ **${user.user.tag}** ha sido silenciado por **${timeLabel}**.\n**Razón:** ${reason}`);

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    },
};
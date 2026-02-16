const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra el estado de conexión y latencia del bot.'),
    async execute(interaction) {
        // Obtenemos la latencia de la API de Discord
        const apiPing = Math.round(interaction.client.ws.ping);
        
        // Calculamos la latencia del bot (tiempo de respuesta del comando)
        const sent = await interaction.deferReply({ fetchReply: true });
        const botPing = sent.createdTimestamp - interaction.createdTimestamp;

        const pingEmbed = new EmbedBuilder()
            .setColor('#8b5cf6') // El violeta de tu web
            .setTitle('📡 Estado del Sistema')
            .addFields(
                { name: '🤖 Bot Latency', value: `\`${botPing}ms\``, inline: true },
                { name: '🌐 API Latency', value: `\`${apiPing}ms\``, inline: true },
                { name: '💻 Servidor', value: `\`Render Cloud\``, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [pingEmbed] });
    },
};
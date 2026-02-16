const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('Muestra el avatar y perfil de un jugador de Roblox.')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Nombre del usuario de Roblox')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');

        try {
            // 1. Obtener ID del usuario por su nombre
            const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
            });
            const userData = await userRes.json();

            if (!userData.data || userData.data.length === 0) {
                return interaction.reply({ content: `❌ No se encontró al usuario **${username}**.`, ephemeral: true });
            }

            const userId = userData.data[0].id;
            const displayName = userData.data[0].displayName;

            // 2. Obtener el Avatar (Full Body)
            const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`);
            const avatarData = await avatarRes.json();
            const avatarUrl = avatarData.data[0].imageUrl;

            const embed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle(`🎮 Perfil de ${displayName}`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setDescription(`**Username:** \`${username}\`\n**ID:** \`${userId}\``)
                .setImage(avatarUrl)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(' [DEBUG] Error en comando roblox:', error);
            await interaction.reply({ content: '❌ Error al conectar con la API de Roblox.', ephemeral: true });
        }
    },
};
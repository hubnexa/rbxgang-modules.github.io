const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const admin = require('firebase-admin');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credits')
        .setDescription('Consulta tu balance de créditos en RBXGANG.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const db = admin.firestore();

        try {
            // Referencia a la colección Balance > ID del usuario
            const docRef = db.collection('Balance').doc(userId);
            const doc = await docRef.get();

            let credits = 0;

            if (doc.exists) {
                credits = doc.data().credits || 0;
            } else {
                // Opcional: Si el usuario no existe, podrías crearlo aquí con 0 créditos
                await docRef.set({ credits: 0 });
            }

            // Función para formatear el número (1000 -> 1,000)
            const formatNumber = (num) => {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };

            const embed = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('💰 Balance de Créditos')
                .setDescription(`Hola **${interaction.user.username}**, aquí tienes tu balance actual:`)
                .addFields(
                    { name: 'Créditos Disponibles', value: `\`${formatNumber(credits)}\` cr$`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(' [DEBUG] Error al consultar créditos:', error);
            await interaction.reply({ 
                content: '❌ Hubo un error al conectar con la base de datos.', 
                ephemeral: true 
            });
        }
    },
};
require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ActivityType
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('RBXGANG Bot está vivo 🚀');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor de mantenimiento activo');
});

client.commands = new Collection();

const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require('./firebase-admin-key.json')) 
    });
}
const db = admin.firestore();

process.on('unhandledRejection', (reason, promise) => {
    console.error(' [DEBUG] Rechazo no manejado en:', promise, 'razón:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error(' [DEBUG] Excepción no capturada:', err, 'en:', origin);
});

const foldersPath = path.join(__dirname, 'Commands');
if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(` ✅ Comando cargado: ${folder}/${file}`);
            } else {
                console.warn(` [DEBUG] El comando en ${filePath} no tiene las propiedades "data" o "execute".`);
            }
        }
    }
}

client.on('interactionCreate', async interaction => {
    // Manejo de Comandos (Ya lo tienes)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction).catch(console.error);
    }

    // --- NUEVO: Manejo del Botón de Verificación ---
    if (interaction.isButton()) {
        if (interaction.customId === 'verify_button') {
            const clientId = process.env.CLIENT_ID;
            // Generamos la URL de tu web rbxgang.xyz
            const verifyUrl = `https://rbxgang.xyz/auth/server/?client_id=${clientId}&user_id=${interaction.user.id}`;

            const embedResponse = new EmbedBuilder()
                .setColor('#8b5cf6')
                .setTitle('🔗 Enlace de Verificación')
                .setDescription('Haz clic en el botón para completar la verificación en nuestra web.')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Ir a la Web')
                    .setURL(verifyUrl)
                    .setStyle(ButtonStyle.Link)
            );

            await interaction.reply({ 
                embeds: [embedResponse], 
                components: [row], 
                ephemeral: true 
            });
        }
    }
});

async function processVerifications() {
    try {
        const usersRef = db.collection('ServerUsers');
        const snapshot = await usersRef.where('status', '==', 'verified').get();

        if (snapshot.empty) return;

        // Cargar configuraciones
        const verifyConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'Data', 'verify.json'), 'utf8'));
        const serversData = fs.existsSync(path.join(__dirname, 'Data', 'servers.json')) 
            ? JSON.parse(fs.readFileSync(path.join(__dirname, 'Data', 'servers.json'), 'utf8')) 
            : {};

        const guildId = '1468322673087217887';
        const guild = client.guilds.cache.get(guildId); 
        const role = guild?.roles.cache.get(verifyConfig.verifiedRole);
        
        // Canal de logs (usamos el logChannel configurado en /set)
        const logChannelId = serversData[guildId]?.logChannel;
        const logChannel = "1471282267811741808";

        for (const doc of snapshot.docs) {
            const userData = doc.data();

            if (userData.roleGived === true) continue; 

            const member = await guild.members.fetch(userData.discordId).catch(() => null);

            if (member) {
                await member.roles.add(role);
                
                // Actualizar Firebase
                await doc.ref.update({
                    roleGived: true,
                    roleGivedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log(` ✅ Rol otorgado a: ${member.user.tag}`);

                // --- ENVIAR LOG DE VERIFICACIÓN ---
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#8b5cf6')
                        .setTitle('🛡️ Nueva Verificación Completada')
                        .addFields(
                            { name: '👤 Usuario', value: `${member.user.tag}`, inline: true },
                            { name: '🆔 Discord ID', value: `\`${userData.discordId}\``, inline: true },
                            { name: '🌐 Dirección IP', value: `||${userData.ip || 'No registrada'}||`, inline: true }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        }
    } catch (error) {
        console.error(" [DEBUG] Error en ciclo de verificación:", error);
    }
}

client.once('ready', async () => {
    console.log(` 🚀 Bot encendido como: ${client.user.tag}`);

    // --- REGISTRO DE COMANDOS (Auto-Deploy) ---
    const { REST, Routes } = require('discord.js');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        const commandsData = client.commands.map(cmd => cmd.data.toJSON());
        console.log(` 🔄 Iniciando actualización de ${commandsData.length} comandos...`);

        // Esto los registra GLOBALMENTE (tarda unos minutos en aparecer en todos los servers)
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commandsData },
        );

        setInterval(processVerifications, 2000);

        client.user.setPresence({
        activities: [{ 
            name: 'rbxgang.xyz', // Texto que aparecerá
            type: ActivityType.Watching // Tipo: Viendo
        }],
        status: 'online', // Estado: En línea (verde)
    });

        console.log(' ✅ Comandos de aplicación registrados con éxito.');
    } catch (error) {
        console.error(' ❌ Error al registrar comandos:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);

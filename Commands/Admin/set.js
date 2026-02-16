const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Configuración del servidor RBXGANG')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        // Subcomando: logchannel
        .addSubcommand(subcommand =>
            subcommand
                .setName('logchannel')
                .setDescription('Establece el canal de logs para el sistema')
                .addChannelOption(option => 
                    option.setName('canal').setDescription('Canal de texto').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        // Subcomando: staffrole
        .addSubcommand(subcommand =>
            subcommand
                .setName('staffrole')
                .setDescription('Establece el rol de staff para comandos especiales')
                .addRoleOption(option => 
                    option.setName('rol').setDescription('El rol de staff').setRequired(true)))
        // Subcomando: confesschannel
        .addSubcommand(subcommand =>
            subcommand
                .setName('confesschannel')
                .setDescription('Establece el canal donde se enviarán las confesiones')
                .addChannelOption(option => 
                    option.setName('canal').setDescription('Canal de texto').addChannelTypes(ChannelType.GuildText).setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const dataDir = path.join(__dirname, '../../Data');
        const dataPath = path.join(dataDir, 'servers.json');

        // Asegurar que la carpeta Data existe
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

        let serversData = {};
        if (fs.existsSync(dataPath)) {
            serversData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        if (!serversData[guildId]) serversData[guildId] = {};

        let responseText = "";

        if (sub === 'logchannel') {
            const channel = interaction.options.getChannel('canal');
            serversData[guildId].logChannel = channel.id;
            responseText = `✅ Canal de logs establecido en ${channel}.`;
        } 
        
        else if (sub === 'staffrole') {
            const role = interaction.options.getRole('rol');
            serversData[guildId].staffRole = role.id;
            responseText = `✅ Rol de staff establecido en **${role.name}**.`;
        } 
        
        else if (sub === 'confesschannel') {
            const channel = interaction.options.getChannel('canal');
            serversData[guildId].confessChannel = channel.id;
            responseText = `✅ Canal de confesiones establecido en ${channel}.`;
        }

        fs.writeFileSync(dataPath, JSON.stringify(serversData, null, 2));
        await interaction.reply({ content: responseText, ephemeral: true });
    },
};
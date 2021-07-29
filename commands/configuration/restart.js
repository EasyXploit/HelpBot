exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!restart
    
    try {
        let restartingEmbed = new discord.MessageEmbed()
            .setColor(12118406)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription('Reiniciando al bot . . .');
        message.channel.send(restartingEmbed);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.blue)
            .setTitle('📑 Auditoría - [ESTADO DEL BOT]')
            .setDescription(`**${message.author.tag}** reinició a **${client.user.username}**`);

        // Destrucción de la actividad
        client.destroy();
        console.log(`${new Date().toLocaleString()} 》Deteniendo ${client.user.username} . . .`);
        
         // Inicio de sesión del bot
        client.login(client.config.keys.token);
        console.log(`${new Date().toLocaleString()} 》Iniciando ${client.user.username} . . .\n`);
        client.emit('ready');
        client.loggingChannel.send(loggingEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'restart',
    aliases: ['reboot']
};

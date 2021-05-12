exports.run = async (discord, client, message, args, command) => {
    
    //-restart
    
    try {
        let restartingEmbed = new discord.MessageEmbed()
            .setColor(12118406)
            .setTitle(`${client.emotes.greenTick} Operación completada`)
            .setDescription('Reiniciando PilkoBot . . .');
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
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}

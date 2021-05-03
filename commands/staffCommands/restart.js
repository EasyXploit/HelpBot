exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-restart
    
    try {
        let restartingEmbed = new discord.MessageEmbed()
            .setColor(12118406)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription('Reiniciando PilkoBot . . .');
        message.channel.send(restartingEmbed);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.blue)
            .setTitle('📑 Auditoría - [ESTADO DEL BOT]')
            .setDescription(`**${message.author.tag}** reinició a **${client.user.username}**`);

        // Destrucción de la actividad
        client.destroy();
        console.log(`${new Date().toLocaleString()} 》Deteniendo ${client.user.username} . . .`);
        
         // Inicio de sesión del bot
        client.login(keys.token);
        console.log(`${new Date().toLocaleString()} 》Iniciando ${client.user.username} . . .\n`);
        client.emit('ready');
        loggingChannel.send(loggingEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

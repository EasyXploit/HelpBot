exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!stop
    
    try {
  
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`Deteniendo ${client.user.username} . . .`); 

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.orange)
            .setTitle('📑 Auditoría - [ESTADO DEL BOT]')
            .setDescription(`**${message.author.tag}** detuvo a **${client.user.username}**. \nEl bot tendrá que ser arrancado manualmente.`);

        console.log(`${new Date().toLocaleString()} 》Deteniendo ${client.user.username} a petición de ${message.author.tag}.`);
        
        await message.channel.send(successEmbed);
        await client.functions.loggingManager(loggingEmbed);
        
        await client.destroy();
        process.exit();
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}

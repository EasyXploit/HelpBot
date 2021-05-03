exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-stop
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
  
        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`Deteniendo ${client.user.username} . . .`); 

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.orange)
            .setDescription(`**${message.author.tag}** detuvo a **${client.user.username}**. \nEl bot tendrá que ser arrancado manualmente`);
            .setTitle('📑 Auditoría - [ESTADO DEL BOT]')

        console.log(`${new Date().toLocaleString()} 》Deteniendo ${client.user.username} a petición de ${message.author.username}`);
        
        await message.channel.send(successEmbed);
        await loggingChannel.send(loggingEmbed);
        
        await client.destroy();
        process.exit();
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

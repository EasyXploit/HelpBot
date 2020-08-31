exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-stop
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
  
        let successEmbed = new discord.MessageEmbed ()
            .setColor(resources.green)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`Deteniendo ${bot.user.username} . . .`); 

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(resources.orange)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL())
            .setTitle('📑 Auditoría')
            .setDescription(`**${message.author.tag}** detuvo a **${bot.user.username}**. \nEl bot tendrá que ser arrancado manualmente`);

        console.log(`${new Date().toLocaleString()} 》Deteniendo ${bot.user.username} a petición de ${message.author.username}`);
        
        await message.channel.send(successEmbed);
        await loggingChannel.send(loggingEmbed);
        
        await bot.destroy();
        process.exit();
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}

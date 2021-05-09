exports.run = async (discord, fs, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //-stop
    
    try {
        if (message.author.id !== client.config.guild.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
  
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.emotes.greenTick} Operación completada`)
            .setDescription(`Deteniendo ${client.user.username} . . .`); 

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.orange)
            .setTitle('📑 Auditoría - [ESTADO DEL BOT]')
            .setDescription(`**${message.author.tag}** detuvo a **${client.user.username}**. \nEl bot tendrá que ser arrancado manualmente.`);

        console.log(`${new Date().toLocaleString()} 》Deteniendo ${client.user.username} a petición de ${message.author.tag}.`);
        
        await message.channel.send(successEmbed);
        await client.loggingChannel.send(loggingEmbed);
        
        await client.destroy();
        process.exit();
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}

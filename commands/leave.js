exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)
    
    //!leave

    try {
        let notInChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no está en ningún canal de voz.`);
        
        let notInYourChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que el bot.`);

        //Comprueba si hay una conexión de voz
        if (!message.guild.voiceConnection) return message.channel.send(notInChannelEmbed);

        //Comprueba si está en la sala del miembro
        if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notInYourChannelEmbed);

        //Aborta la conexión
        bot.voiceConnection.disconnect();
        if (bot.servers[message.guild.id]) delete bot.servers[message.guild.id];

        //Cambia el estatus a "DISPONIBLE"
        bot.voiceStatus = true;
        
        //Manda un mensaje de confirmación
        await message.channel.send(`⏏ | He abandonado el canal`);
        
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}


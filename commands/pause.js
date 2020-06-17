exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    const noPrivilegesEmbed = new discord.MessageEmbed ()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)
    
    //!pause

    try {
        let notPlayingEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${bot.user.id}>.`);
        
        let alreadyPausedEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot ya está pausado.`);

        //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
        if (!message.guild.voiceConnection) return message.channel.send(notPlayingEmbed);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send(notAvailableEmbed);

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si la reproducción ya está pausada
        if (bot.voiceDispatcher.paused) return message.channel.send(alreadyPausedEmbed);

        //Reanuda la reproducción y manda un mensaje de confirmación
        await bot.voiceDispatcher.pause();
        await message.channel.send(`⏸ | Cola pausada`);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

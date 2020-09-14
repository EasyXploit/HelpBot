exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!resume

    try {
        let notPlayingEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);
        
        let notPausedEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no está pausado.`);

        //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
        if (!message.guild.voice) return message.channel.send(notPlayingEmbed);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(notAvailableEmbed);

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si la reproducción ya está pausada
        if (!client.voiceDispatcher.paused) return message.channel.send(notPausedEmbed);
        
        let noTalkPermissionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

        //Reanuda la reproducción y manda un mensaje de confirmación
        await client.voiceDispatcher.resume();
        await message.channel.send(`▶ | Cola reanudada`);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

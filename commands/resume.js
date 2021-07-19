exports.run = async (discord, client, message, args, command) => {
    
    //!resume

    try {
        let notPlayingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);
        
        let notPausedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} El bot no está pausado.`);

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
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para hablar en esta sala.`);

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'resume')) {
            //Reanuda la reproducción y manda un mensaje de confirmación
            await client.voiceDispatcher.resume();
            await message.channel.send(`▶ | Cola reanudada`);
        };
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    } catch (error) {
    }
}

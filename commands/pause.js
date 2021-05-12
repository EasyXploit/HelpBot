exports.run = async (discord, client, message, args, command) => {
    
    //!pause

    try {
        let notPlayingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let alreadyPausedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} El bot ya está pausado.`);

        //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
        if (!message.guild.voice) return message.channel.send(notPlayingEmbed);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(notAvailableEmbed);

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);

        //Comprueba si no hay reproducción
        if (!client.queues[message.guild.id].nowplaying || Object.entries(client.queues[message.guild.id].nowplaying).length === 0) return message.channel.send(notPlayingEmbed);
        
        //Comprueba si la reproducción ya está pausada
        if (!client.voiceDispatcher || client.voiceDispatcher.paused) return message.channel.send(alreadyPausedEmbed);

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'pause')) {
            //Reanuda la reproducción y manda un mensaje de confirmación
            await client.voiceDispatcher.pause();
            await message.channel.send(`⏸ | Cola pausada`);
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
};

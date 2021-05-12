exports.run = async (discord, client, message, args, command) => {

    //!replay

    try {
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} No hay nada en reproducción.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voice) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send(noDispatcherEmbed);

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'replay')) {
            let nowplaying = client.queues[message.guild.id].nowplaying;
        
            //Genera la información de la cola
            let newQueueItem = {
                link: nowplaying.link,
                title: nowplaying.title,
                duration: nowplaying.duration,
                requestedBy: nowplaying.requestedBy,
                requestedById: nowplaying.requestedById
            };

            //Sube la canción a la cola en el primer puesto y hace skip
            await client.queues[message.guild.id].queue.splice(0, 0, newQueueItem);
            await client.voiceDispatcher.end();
            
            //Manda un mensaje de confirmación
            await message.channel.send(`${client.emotes.greenTick} | La canción se volverá a reproducir`);
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}

exports.run = async (discord, fs, client, message, args, command) => {

    //!loop

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
        
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} No hay nada en la cola.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voice) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send(noDispatcherEmbed);

        //Almacena la información del servidor
        let server = client.servers[message.guild.id];
        
        //Comprueba si hay cola
        if (!server || server.queue < 0) return message.channel.send(noQueueEmbed);

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'loop')) {
            if (server.mode !== 'loop') {
                //Activa el modo Loop
                server.mode = 'loop';
    
                //Vuelve a añadir la canción al inicio de la cola
                let newQueueItem = {
                    link: server.nowplaying.link,
                    title: server.nowplaying.title,
                    duration: server.nowplaying.duration,
                    requestedBy: server.nowplaying.requestedBy,
                    requestedById: server.nowplaying.requestedById
                };
    
                //Sube la canción a la cola
                server.queue.unshift(newQueueItem);
    
                //Manda un mensaje de confirmación
                message.channel.send(`🔂 | He activado el modo bucle`);
            } else if (server.mode === 'loop') {
                //Desactiva el modo Loop
                server.mode = false;
    
                //Borra el primer elemento de la cola
                server.queue.shift();
    
                //Manda un mensaje de confirmación
                message.channel.send(`▶ | He desactivado el modo bucle`);
            };
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
}

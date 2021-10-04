exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!shuffle

    try {
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No hay nada en reproducción.`);
        
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No hay nada en la cola.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.me.voice) return message.channel.send({ embeds: [noConnectionEmbed] });

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({ embeds: [noChannelEmbed] });
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelId !== message.guild.member(client.user).voice.channelId) return message.channel.send({ embeds: [notAvailableEmbed] });
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send({ embeds: [noDispatcherEmbed] });

        //Almacena la información del servidor
        let server = client.queues[message.guild.id];
        
        //Comprueba si hay cola
        if (!server || server.queue <= 0) return message.channel.send({ embeds: [noQueueEmbed] });

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'shuffle')) {
            if (server.mode !== 'shuffle') {
                //Activa el modo shuffle
                server.mode = 'shuffle';
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: `🔀 | He activado el modo aleatorio` });
            } else if (server.mode === 'shuffle') {
                //Desactiva el modo shuffle
                server.mode = false;
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: `▶ | He desactivado el modo aleatorio` });
            };
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'shuffle',
    aliases: ['sh']
};

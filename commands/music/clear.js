exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!clear

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
        if (!message.guild.voice) return message.channel.send({ embeds: [noConnectionEmbed] });

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({ embeds: [noChannelEmbed] });
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelId !== message.guild.member(client.user).voice.channelId) return message.channel.send({ embeds: [notAvailableEmbed] });
        {}
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send({ embeds: [noDispatcherEmbed] });
        
        //Comprueba si hay cola
        if (!client.queues[message.guild.id] || client.queues[message.guild.id].queue <= 0) return message.channel.send({ embeds: [noQueueEmbed] });

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'clear')) {
            //Borra la cola
            client.queues[message.guild.id].queue = [];
            
            //Manda un mensaje de confirmación
            await message.channel.send({ content: `${client.customEmojis.greenTick} | Cola eliminada` });
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'clear',
    aliases: ['cls']
};

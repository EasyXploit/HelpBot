exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!pause

    try {
        let notPlayingEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let alreadyPausedEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot ya está pausado.`);

        //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
        if (!message.guild.me.voice) return message.channel.send({ embeds: [notPlayingEmbed] });
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({ embeds: [notAvailableEmbed] });

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.member.voice.channelId !== message.guild.member(client.user).voice.channelId) return message.channel.send({ embeds: [notAvailableEmbed] });

        //Comprueba si no hay reproducción
        if (!client.queues[message.guild.id].nowplaying || Object.entries(client.queues[message.guild.id].nowplaying).length === 0) return message.channel.send({ embeds: [notPlayingEmbed] });
        
        //Comprueba si la reproducción ya está pausada
        if (!client.voiceDispatcher || client.voiceDispatcher.paused) return message.channel.send({ embeds: [alreadyPausedEmbed] });

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'pause')) {
            //Reanuda la reproducción y manda un mensaje de confirmación
            await client.voiceDispatcher.pause();
            await message.channel.send({ content: `⏸ | Cola pausada` });
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'pause',
    aliases: []
};

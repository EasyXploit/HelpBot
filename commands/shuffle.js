exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //!shuffle

    try {
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en reproducción.`);
        
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en la cola.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voice) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send(noDispatcherEmbed);
        
        //Comprueba si hay cola
        if (!client.servers[message.guild.id] || client.servers[message.guild.id].queue <= 0) return message.channel.send(noQueueEmbed);
        
        if (client.servers[message.guild.id].shuffle === false) {
            //Activa el modo shuffle
            client.servers[message.guild.id].shuffle = true;

            //Manda un mensaje de confirmación
            message.channel.send(`🔀 | He activado el modo aleatorio`);
        } else if (client.servers[message.guild.id].shuffle === true) {
            //Desactiva el modo shuffle
            client.servers[message.guild.id].shuffle = false;

            //Manda un mensaje de confirmación
            message.channel.send(`▶ | He desactivado el modo aleatorio`);
        } else {
            return message.channel.send(`Error`);
        }
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

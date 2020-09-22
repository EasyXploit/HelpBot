exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!leave

    try {
        let notInChannelEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no está en ningún canal de voz.`);
        
        let notInYourChannelEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que ${client.user.username}.`);

        //Comprueba si hay una conexión de voz
        if (!message.guild.voice) return message.channel.send(notInChannelEmbed);

        //Comprueba si está en la sala del miembro
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notInYourChannelEmbed);

        //Comprueba si es necesaria una votación
        if (await resources.evaluateDjOrVotes(message, 'leave')) {
            //Aborta la conexión
            client.voiceConnection.disconnect();
            if (client.servers[message.guild.id]) delete client.servers[message.guild.id];

            //Cambia el estatus a "DISPONIBLE"
            client.voiceStatus = true;

            //Vacia el dispatcher
            client.voiceDispatcher = false;

            //Vacia la conexión
            client.voiceConnection = false;
            
            //Manda un mensaje de confirmación
            await message.channel.send(`⏏ | He abandonado el canal`);
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}



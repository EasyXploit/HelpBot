exports.run = async (discord, fs, client, message, args, command) => {
    
    //!leave

    try {
        let notInChannelEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} El bot no está en ningún canal de voz.`);
        
        let notInYourChannelEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Debes estar en el mismo canal de voz que ${client.user.username}.`);

        //Comprueba si hay una conexión de voz
        if (!message.guild.voice) return message.channel.send(notInChannelEmbed);

        //Comprueba si está en la sala del miembro
        let joined;
        message.member.voice.channel.members.forEach(member => {
            if (member.user.id === client.user.id) joined = member;
        });

        if (!joined) return message.channel.send(notInYourChannelEmbed);

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'leave')) {
            //Aborta la conexión
            joined.voice.kick();
            if (client.queues[message.guild.id]) delete client.queues[message.guild.id];

            //Cambia el estatus a "DISPONIBLE"
            client.voiceStatus = true;

            //Vacia el dispatcher
            client.voiceDispatcher = false;

            //Vacia la conexión
            client.voiceConnection = false;

            //Anula el timeout de desconexión
            clearTimeout(client.voiceTimeout);
            
            //Manda un mensaje de confirmación
            await message.channel.send(`⏏ | He abandonado el canal`);
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}



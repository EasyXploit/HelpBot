exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!leave

    try {
        let notInChannelEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está en ningún canal de voz.`);
        
        let notInYourChannelEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que ${client.user.username}.`);

        //Comprueba si hay una conexión de voz
        if (!message.guild.me.voice) return message.channel.send({ embeds: [notInChannelEmbed] });

        //Comprueba si está en la sala del miembro
        let joined;
        message.member.voice.channel.members.forEach(member => {
            if (member.user.id === client.user.id) joined = member;
        });

        if (!joined) return message.channel.send({ embeds: [notInYourChannelEmbed] });

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
            await message.channel.send({ content: `⏏ | He abandonado el canal` });
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'leave',
    aliases: ['le']
};



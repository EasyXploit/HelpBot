exports.run = async (client, message, args, command, commandConfig) => {
    
    //!leave

    try {

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Comprueba si el bot está conectado
        if (!connection || connection._state.status === 'disconnected') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está conectado.`)
        ]});

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)
        ]});

        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'leave')) {

            //Aborta la conexión
            connection.destroy();

            //Almacena la información del servidor
            let reproductionQueue = client.reproductionQueues[message.guild.id];

            //Vacía el timeout de desconexión por inactividad
            if (reproductionQueue.timeout) {
                clearTimeout(reproductionQueue.timeout);
                reproductionQueue.timeout = null;
            };

            //Borra la información de reproducción del server
            delete client.reproductionQueues[message.guild.id];
            
            //Confirma la acción
            message.channel.send({ content: '⏏ | He abandonado el canal' });
        };

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'leave',
    aliases: ['le']
};

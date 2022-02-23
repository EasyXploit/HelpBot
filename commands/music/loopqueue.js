exports.run = async (client, message, args, command, commandConfig) => {

    //!loopqueue

    try {
        
        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!connection) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no está conectado a ningún canal.`)]
        });

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)]
        });

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;

        //Comprueba si el bot no tiene reproductor suscrito o este se encuentra inactivo
        if (!subscription || subscription.player.state.status === 'idle') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está vacía.`)]
        });

        //Almacena la información del servidor
        let reproductionQueue = client.reproductionQueues[message.guild.id];
        
        //Comprueba si hay cola
        if (!reproductionQueue || reproductionQueue.tracks.length <= 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No hay nada en la cola.`)]
        });

        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'loopqueue')) {
            if (reproductionQueue.mode !== 'loopqueue') {

                //Activa el modo Loop
                reproductionQueue.mode = 'loopqueue';
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: '🔁 | He activado el modo bucle en la cola' });
            } else if (reproductionQueue.mode === 'loopqueue') {

                //Desactiva el modo Loop
                reproductionQueue.mode = false;
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: '▶ | He desactivado el modo bucle en la cola' });
            };
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'loopqueue',
    aliases: ['lq']
};

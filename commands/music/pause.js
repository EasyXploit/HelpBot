exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'same-channel'])) return;

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Almacena el reproductor suscrito
        const player = connection._state.subscription.player;

        //Comprueba si el bot ya estaba pausado
        if (player.state.status === 'paused') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot ya está pausado.`)
        ]});

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'pause')) {

            //Almacena la información de reproducción de la guild
            const reproductionQueue = client.reproductionQueues[connection.joinConfig.guildId];

            //Crea un contador para demorar la salida del canal y la destrucción de la cola
            if (reproductionQueue) reproductionQueue.timeout = setTimeout(() => {

                //Aborta la conexión
                if (connection.state.status !== 'Destroyed') connection.destroy();

                //Confirma la acción
                reproductionQueue.boundedTextChannel.send({ content: '⏏ | He abandonado el canal y borrado la cola' });

                //Borra la información de reproducción de la guild
                delete client.reproductionQueues[connection.joinConfig.guildId];

            }, client.config.music.maxPausedTime);
            
            //Pausa la reproducción
            await player.pause();

            //Manda un mensaje de confirmación
            await message.channel.send({ content: '⏸ | Cola pausada' });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'pause',
    description: 'Pausa la cola de reproducción.',
    aliases: [],
    parameters: ''
};

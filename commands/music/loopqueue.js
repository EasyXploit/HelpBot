exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'loopqueue')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

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

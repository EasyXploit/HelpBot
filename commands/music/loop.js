exports.run = async (client, message, args, command, commandConfig) => {

    //!loop

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue'])) return;
        
        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'loop')) {

            //Almacena la información del servidor
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            if (reproductionQueue.mode !== 'loop') {

                //Activa el modo Loop
                reproductionQueue.mode = 'loop';
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: '🔂 | He activado el modo bucle' });

            } else if (reproductionQueue.mode === 'loop') {

                //Desactiva el modo Loop
                reproductionQueue.mode = false;
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: '▶ | He desactivado el modo bucle' });
            };
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'loop',
    aliases: ['l']
};

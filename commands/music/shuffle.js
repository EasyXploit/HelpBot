exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'shuffle')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            if (reproductionQueue.mode !== 'shuffle') {

                //Activa el modo shuffle
                reproductionQueue.mode = 'shuffle';
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: '🔀 | He activado el modo aleatorio' });
            } else if (reproductionQueue.mode === 'shuffle') {
                
                //Desactiva el modo shuffle
                reproductionQueue.mode = false;
    
                //Manda un mensaje de confirmación
                message.channel.send({ content: '▶ | He desactivado el modo aleatorio' });
            };
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'shuffle',
    aliases: ['sh']
};

exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected',  'same-channel',  'has-queue',  'can-speak'])) return;
        
        //Comprueba si es necesaria una votación
        if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'replay')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Sube la pista a la cola en el primer puesto y hace skip
            await reproductionQueue.tracks.splice(1, 0, reproductionQueue.tracks[0]);

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(message.guild.id);

            //Salta la pista
            connection._state.subscription.player.stop();
            
            //Manda un mensaje de confirmación
            await message.channel.send({ content: `${client.customEmojis.greenTick} | La pista se volverá a reproducir` });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'replay',
    description: 'Reproduce la pista actual desde el principio.',
    aliases: ['rp'],
    parameters: ''
};

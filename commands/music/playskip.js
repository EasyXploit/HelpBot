exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue', 'can-speak'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'playskip', 0)) {

            //Envía un mensaje de confirmación de la búsqueda
            message.channel.send({ content: `🔎 | Buscando \`${args.join(' ')}\` ...` });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            const resultFound = await require('../../utils/voiceSubsystem/fetchResource.js').run(client, args, message, 'stream', args.join(' '));

            //No continua si no se ha conseguido crear
            if (resultFound !== true) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Obtiene el último ítem de la cola
            let toMove = reproductionQueue.tracks[reproductionQueue.tracks.length - 1];
            
            //Elimina el item de la cola
            reproductionQueue.tracks.splice(reproductionQueue.tracks.length - 1, 1);
            
            //Lo vuelve a introducir en la segunda posición
            reproductionQueue.tracks.splice(1, 0, toMove);

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(message.guild.id);

            //Para el reproductor
            connection._state.subscription.player.stop();

            //Manda un mensaje de confirmación
            await message.channel.send({ content: '⏭ | Canción omitida' });

        };


    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'playskip',
    description: 'Busca una canción o lista de reproducción por nombre o URL de YouTube y omite la pista actual.',
    aliases: ['ps'],
    parameters: '<URL de YouTube | término de búsqueda>'
};

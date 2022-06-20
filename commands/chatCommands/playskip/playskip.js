exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Almacena el argumento proporcionado por el usuario
        const argument = interaction.options._hoistedOptions[0].value;

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected', 'same-channel', 'has-queue', 'can-speak'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../../utils/voice/testQueuePerms.js').run(client, interaction, 'playskip', 0)) {

            //Envía un mensaje de confirmación de la búsqueda
            interaction.reply({ content: `🔎 | ${client.functions.localeParser(locale.searching, { serachTerm: argument })} ...` });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            const resultFound = await require('../../../utils/voice/fetchResource.js').run(client, interaction, 'stream', argument);

            //No continua si no se ha conseguido crear
            if (resultFound !== true) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Obtiene el último ítem de la cola
            let toMove = reproductionQueue.tracks[reproductionQueue.tracks.length - 1];
            
            //Elimina el item de la cola
            reproductionQueue.tracks.splice(reproductionQueue.tracks.length - 1, 1);
            
            //Lo vuelve a introducir en la segunda posición
            reproductionQueue.tracks.splice(1, 0, toMove);

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Para el reproductor
            connection._state.subscription.player.stop();

            //Manda un mensaje de confirmación
            await reproductionQueue.boundedTextChannel.send({ content: `⏭ | ${locale.skipped}` });
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'search',
                type: 'STRING',
                required: true
            }
        ]
    }
};

exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected', 'same-channel'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, 'leave')) {

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Aborta la conexión
            connection.destroy();

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Vacía el timeout de desconexión por inactividad
            if (reproductionQueue.timeout) {
                clearTimeout(reproductionQueue.timeout);
                reproductionQueue.timeout = null;
            };

            //Borra la información de reproducción del server
            delete client.reproductionQueues[interaction.guild.id];
            
            //Confirma la acción
            interaction.reply({ content: `⏏ | ${locale.leftChannel}` });
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
        type: 'CHAT_INPUT'
    }
};
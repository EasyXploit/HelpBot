exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected',  'same-channel',  'has-queue',  'can-speak'])) return;
        
        //Comprueba si es necesaria una votación
        if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, 'replay')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Sube la pista a la cola en el primer puesto y hace skip
            await reproductionQueue.tracks.splice(1, 0, reproductionQueue.tracks[0]);

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Salta la pista
            connection._state.subscription.player.stop();
            
            //Manda un mensaje de confirmación
            await interaction.reply({ content: `🔁 | ${locale.willReplay}` });
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

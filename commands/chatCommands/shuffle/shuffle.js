exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../../utils/voice/testQueuePerms.js').run(client, interaction, 'shuffle')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            if (reproductionQueue.mode !== 'shuffle') {

                //Activa el modo shuffle
                reproductionQueue.mode = 'shuffle';
    
                //Manda un mensaje de confirmación
                interaction.reply({ content: `🔀 | ${locale.enabled}` });

            } else if (reproductionQueue.mode === 'shuffle') {
                
                //Desactiva el modo shuffle
                reproductionQueue.mode = false;
    
                //Manda un mensaje de confirmación
                interaction.reply({ content: `▶ | ${locale.disabled}` });
            };
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

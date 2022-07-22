exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'shuffle')) {

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
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT'
    }
};

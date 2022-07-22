exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected', 'same-channel', 'has-queue'])) return;

        //Almacena la selección del usuario
        const selection = interaction.options._hoistedOptions[0].value;
        
        //Comprueba si es necesaria una votación
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, selection)) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Si se desea deshabilitar el modo bucle
            if (selection === 'disabled') {

                //Comprueba si el modo estaba activado
                if (!['loopsingle', 'loopqueue'].includes(reproductionQueue.mode)) {

                    //Devuelve un error si no estab activado
                    return interaction.reply({ content: `${client.customEmojis.redTick} | ${locale.notEnabled}`, ephemeral: true });
                };
    
                //Manda un mensaje de confirmación
                interaction.reply({ content: `▶ | ${locale[reproductionQueue.mode].disabled}` });

                //Desactiva el modo bucle
                return reproductionQueue.mode = false;
            };

            if (reproductionQueue.mode !== selection) {

                //Activa el modo bucle
                reproductionQueue.mode = selection;
    
                //Manda un mensaje de confirmación
                interaction.reply({ content: `🔂 | ${locale[selection].enabled}` });

            } else if (reproductionQueue.mode === selection) {

                //Desactiva el modo bucle
                reproductionQueue.mode = false;
    
                //Manda un mensaje de confirmación
                interaction.reply({ content: `▶ | ${locale[selection].disabled}` });
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
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'mode',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        choiceName: 'single',
                        value: 'loopsingle'
                    },
                    {
                        choiceName: 'queue',
                        value: 'loopqueue'
                    },
                    {
                        choiceName: 'disabled',
                        value: 'disabled'
                    }
                ]
            }
        ]
    }
};

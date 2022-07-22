exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected', 'same-channel', 'has-queue'])) return;
        
        //Almacena los argumentos proporcionados por el usuario
        const origin = interaction.options._hoistedOptions[0].value;
        const destination = interaction.options._hoistedOptions[1].value;
        
        //Comprueba si no es 0
        if (origin === 0 || destination === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.belowOne}.`)
        ], ephemeral: true});

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];
        
        //Comprueba si el valor introducido es válido
        if (origin > (reproductionQueue.tracks.length) || destination > (reproductionQueue.tracks.length)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.tooHigh}.`)
        ], ephemeral: true});

        //Comprueba si es necesaria una votación
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'move')) {

            //Obtiene el objeto a desplazar
            let toMove = reproductionQueue.tracks[origin];
            
            //Elimina el objeto
            reproductionQueue.tracks.splice(origin, 1);
            
            //Lo vuelve a introducir en la ubicación especificada
            reproductionQueue.tracks.splice(destination, 0, toMove);
            
            //Manda un mensaje de confirmación
            await interaction.reply({ content: `${client.customEmojis.greenTick} | ${locale.movedTrack}` });
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
                optionName: 'origin',
                type: 'INTEGER',
                required: true
            },
            {
                optionName: 'destination',
                type: 'INTEGER',
                required: true
            }
        ]
    }
};

exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Almacena el argumento proporcionado por el usuario (si lo hay)
        const argument = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null;

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];
        
        if (argument === 'all') {

            //Comprueba si es necesaria una votación
            if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, 'remove-all')) {

                //Elimina el elemento de la cola
                await reproductionQueue.tracks.splice(1);
                
                //Manda un mensaje de confirmación
                await interaction.reply({ content: `${client.customEmojis.greenTick} | ${locale.allDeleted}` });
            };

        } else {

            //Comprueba si se ha proporcionado un número entero
            if (!Number.isInteger(parseInt(argument))) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.nonInt}.`)
            ], ephemeral: true});
            
            //Comprueba si no es 0
            if (argument <= 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.belowOne}.`)
            ], ephemeral: true});
            
            //Comprueba si el valor introducido es válido
            if (argument >= (reproductionQueue.tracks.length)) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.doesntExist, { number: argument })}.`)
            ], ephemeral: true});

            //Comprueba si es necesaria una votación
            if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, 'remove', argument)) {

                //Elimina el elemento de la cola
                await reproductionQueue.tracks.splice(argument, 1);
                
                //Manda un mensaje de confirmación
                await interaction.reply({ content: `🗑️ | ${locale.deletedTrack}` });
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
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'position',
                type: 'STRING',
                required: true
            }
        ]
    }
};

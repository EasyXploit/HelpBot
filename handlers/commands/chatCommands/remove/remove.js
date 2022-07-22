exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Almacena el argumento proporcionado por el usuario
        const argument = interaction.options._hoistedOptions[0].value;

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];
        
        //Comprueba si no es 0
        if (argument <= 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.belowOne}.`)
        ], ephemeral: true});
        
        //Comprueba si el valor introducido es válido
        if (argument >= (reproductionQueue.tracks.length)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.doesntExist, { number: argument })}.`)
        ], ephemeral: true});

        //Comprueba si es necesaria una votación
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'remove', argument)) {

            //Elimina el elemento de la cola
            await reproductionQueue.tracks.splice(argument, 1);
            
            //Manda un mensaje de confirmación
            await interaction.reply({ content: `🗑️ | ${locale.deletedTrack}` });
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
                optionName: 'position',
                type: 'NUMBER',
                required: true
            }
        ]
    }
};

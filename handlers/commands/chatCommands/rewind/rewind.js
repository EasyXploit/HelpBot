exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['has-queue'])) return;

        //Almacena los filtros de expresiones regulares para comprobar el formato del parámetro
        const ssFilter = (/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm);
        const mmssFilter = (/(?:[012345]\d):(?:[012345]\d)/gm);
        const hhmmssFilter = (/(?:[012345]\d)/gm);

        //Almacena el argumento proporcionado por el usuario
        const argument = interaction.options._hoistedOptions[0].value;

        //Comprueba si se ha proporcionado un tiempo válido
        if (!argument.match(ssFilter) && !argument.match(mmssFilter) && !argument.match(hhmmssFilter)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidMomentFormat}.`)
        ], ephemeral: true});

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(interaction.guild.id);

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];

        //Devuelve un error si se trata de un vídeo en directo
        if (reproductionQueue.tracks[0].meta.length === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantAdjustLive}.`)
        ], ephemeral: true});

        //Calcula los milisegundos a retroceder
        const rewindMs = await client.functions.utilities.HHMMSSToMs.run(argument);

        //Almacena el progreso actual de la pista
        let actualProgress = connection._state.subscription.player._state.resource.playbackDuration;

        //Calcula si ha de modificar el punto de inicio debido a un seek
        if (reproductionQueue.tracks[0].meta.seekTo) actualProgress = actualProgress + (reproductionQueue.tracks[0].meta.seekTo * 1000);

        //Almacena el objetivo de avance (en milisegunds)
        const rewindToMs = actualProgress - rewindMs;

        //Comprueba si la cantidad es válida
        if (rewindToMs < 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantRweindMore}.`)
        ], ephemeral: true});

        //Almacena el objetivo de avance (en HH:MM:SS)
        const rewindTo = await client.functions.utilities.msToTime.run(client, rewindToMs);

        //Almacena la config. del comando "seek"
        const seekCommand = client.commands.chatCommands.get('seek');

        //Ejecuta el comando "seek"
        await require('../seek/seek.js').run(client, interaction, seekCommand.userConfig, client.locale.handlers.commands.chatCommands.seek, rewindTo);

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
                optionName: 'magnitudes',
                type: 'STRING',
                required: true
            }
        ]
    }
};

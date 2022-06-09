exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['has-queue'])) return;

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

        //Calcula los milisegundos a avanzar
        const forwardMs = await client.functions.HHMMSSToMs(argument);

        //Almacena el progreso actual de la pista
        let actualProgress = connection._state.subscription.player._state.resource.playbackDuration;

        //Calcula si ha de modificar el punto de inicio debido a un seek
        if (reproductionQueue.tracks[0].meta.seekTo) actualProgress = actualProgress + (reproductionQueue.tracks[0].meta.seekTo * 1000);

        //Almacena el objetivo de avance
        const forwardTo = await client.functions.msToDHHMMSS(actualProgress + forwardMs);

        //Ejecuta el comando "seek"
        await require('../seek/seek.js').run(client, interaction, client.locale.commands.chatCommands.seek, forwardTo);

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
                optionName: 'magnitudes',
                type: 'STRING',
                required: true
            }
        ]
    }
};

exports.run = async (client, interaction, locale, commandConfig, inheritedMoment) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected', 'same-channel', 'has-queue', 'can-speak'])) return;

        //Almacena los filtros de expresiones regulares para comprobar el formato del parámetro
        const ssFilter = (/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm);
        const mmssFilter = (/(?:[012345]\d):(?:[012345]\d)/gm);
        const hhmmssFilter = (/(?:[012345]\d)/gm);

        ////Almacena el argumento proporcionado por el usuario, el el heredado por otro comando
        const argument = inheritedMoment ? inheritedMoment : interaction.options._hoistedOptions[0].value;

        //Comprueba si se ha proporcionado un tiempo válido
        if (!argument.match(ssFilter) && !argument.match(mmssFilter) && !argument.match(hhmmssFilter)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidMomentFormat}.`)
        ], ephemeral: true});

        //Calcula los segundos para la propiedad seekTo
        const seekTo = await client.functions.HHMMSSToMs(argument) / 1000;

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];

        //Devuelve un error si se trata de un vídeo en directo
        if (reproductionQueue.tracks[0].meta.length === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantAdjustLive}.`)
        ], ephemeral: true});

        //Almacena el objeto de cola
        const queueItem = reproductionQueue.tracks[0];

        //Comprueba si se quiere modificar la reproducción de un fichero local.
        if (queueItem.type === 'file') return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantAdjustFiles}.`)
        ], ephemeral: true});

        //Comprueba si se ha excedido el tiempo máximo
        if (seekTo * 1000 > queueItem.meta.length - 1000) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.cantForward, { time: client.functions.msToDHHMMSS(queueItem.meta.length - 1000) })}.`)
        ], ephemeral: true});

        //Comprueba si es necesaria una votación
        if (await require('../../../utils/voice/testQueuePerms.js').run(client, interaction, `seek-${argument}`, 0)) {

            //Añade al objeto un tiempo a buscar
            queueItem.meta.seekTo = seekTo;
            
            //Lo vuelve a introducir en la segunda posición
            reproductionQueue.tracks.splice(1, 0, queueItem);

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Para el reproductor
            connection._state.subscription.player.stop();

            //Envía un mensaje de confirmación
            interaction.reply({ content: `📍 | ${client.functions.localeParser(locale.seeked, { time: client.functions.msToDHHMMSS(seekTo * 1000) })}` });
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
                optionName: 'magnitudes',
                type: 'STRING',
                required: true
            }
        ]
    }
};

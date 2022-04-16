exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue', 'can-speak'])) return;

        //Almacena los filtros de expresiones regulares para comprobar el formato del parámetro
        const ssFilter = (/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm);
        const mmssFilter = (/(?:[012345]\d):(?:[012345]\d)/gm);
        const hhmmssFilter = (/(?:[012345]\d)/gm);

        //Comprueba si se ha proporcionado un tiempo válido
        if (!args[0] || (!args[0].match(ssFilter) && !args[0].match(mmssFilter) && !args[0].match(hhmmssFilter))) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Calcula los segundos para la propiedad seekTo
        const seekTo = await client.functions.HHMMSSToMs(args[0]) / 1000;

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];

        //Devuelve un error si se trata de un vídeo en directo
        if (reproductionQueue.tracks[0].meta.length === 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes ajustar el momento de una transmisión en directo`)
        ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

        //Almacena el objeto de cola
        const queueItem = reproductionQueue.tracks[0];

        //Comprueba si se quiere modificar la reproducción de un fichero local.
        if (queueItem.type === 'file') return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No se puede modificar el punto de reproducción de archvios locales.`)]
        });

        //Comprueba si se ha excedido el tiempo máximo
        if (seekTo * 1000 > queueItem.meta.length - 1000) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No se puede avanzar más allá de \`${client.functions.msToHHMMSS(queueItem.meta.length - 1000)}\`.`)]
        });

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voice/testQueuePerms.js').run(client, message, `seek-${args[0]}`, 0)) {

            //Añade al objeto un tiempo a buscar
            queueItem.meta.seekTo = seekTo;
            
            //Lo vuelve a introducir en la segunda posición
            reproductionQueue.tracks.splice(1, 0, queueItem);

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(message.guild.id);

            //Para el reproductor
            connection._state.subscription.player.stop();

            //Envía un mensaje de confirmación
            message.channel.send({ content: `📍 | Situado en el momento \`${client.functions.msToHHMMSS(seekTo * 1000)}\`.` });
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'seek',
    aliases: ['sk']
};

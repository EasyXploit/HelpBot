exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Almacena los filtros de expresiones regulares para comprobar el formato del parámetro
        const ssFilter = (/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/gm);
        const mmssFilter = (/(?:[012345]\d):(?:[012345]\d)/gm);
        const hhmmssFilter = (/(?:[012345]\d)/gm);

        //Comprueba si se ha proporcionado un tiempo válido
        if (!args[0] || (!args[0].match(ssFilter) && !args[0].match(mmssFilter) && !args[0].match(hhmmssFilter))) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];

        //Devuelve un error si se trata de un vídeo en directo
        if (reproductionQueue.tracks[0].meta.length === 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantAdjustLive}.`)
        ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

        //Calcula los milisegundos a avanzar
        const forwardMs = await client.functions.HHMMSSToMs(args[0]);

        //Almacena el progreso actual de la pista
        let actualProgress = connection._state.subscription.player._state.resource.playbackDuration;

        //Calcula si ha de modificar el punto de inicio debido a un seek
        if (reproductionQueue.tracks[0].meta.seekTo) actualProgress = actualProgress + (reproductionQueue.tracks[0].meta.seekTo * 1000);

        //Almacena el objetivo de avance
        const forwardTo = await client.functions.msToHHMMSS(actualProgress + forwardMs);

        //Ejecuta el comando "seek"
        await require('./seek.js').run(client, message, [forwardTo], command, commandConfig);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'forward',
    aliases: ['fw']
};

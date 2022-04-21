exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'has-queue'])) return;

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;
        
        //Almacena el progreso actual de la pista
        let progress = subscription.player._state.resource.playbackDuration;

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];

        //Calcula si ha de modificar el punto de inicio debido a un seek
        if (reproductionQueue.tracks[0].meta.seekTo) progress = progress + (reproductionQueue.tracks[0].meta.seekTo * 1000);

        //Almacena la duración de la pista
        const total = reproductionQueue.tracks[0].meta.length;

        //Calcula el porcentaje de progreso actual
        const percentage = Math.floor((progress * 100) / total);
        
        //Genera una barra de progreso
        let progressBar = Array.from({length: 11}, () => '▬')
        
        //Asigna la posición del indicador en función del porcentaje
        if (percentage <= 10) progressBar[0] = '🔘';
        else if (percentage > 10) progressBar[percentage.toString().slice(0, 1)] = '🔘';

        //Requiere librería para el color
        const randomColor = require('randomcolor');

        //Almacena el progreso formateado
        const formatteProgress = reproductionQueue.tracks[0].meta.length !== 0 ? `${progressBar.join('')} ${percentage}%\n\`${client.functions.msToHHMMSS(progress)} / ${client.functions.msToHHMMSS(total)}\`.` : `${locale.isLive} (${locale.elapsed}: \`${client.functions.msToHHMMSS(progress)}\`).`;

        //Envía el mensaje con el resultado
        message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(randomColor())
            .setAuthor({ name: `${locale.rightNow}:`, iconURL: 'attachment://dj.png' })
            .setDescription(`[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})\n${formatteProgress}`)
            .setFooter({ text: await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild) })
        ], files: ['./resources/images/dj.png'] });

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'nowplaying',
    aliases: ['np']
};

exports.run = async (client, message, args, command, commandConfig) => {
    
    //!nowplaying

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected', 'has-queue'])) return;

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;
        
        //Almacena el progreso actual de la pista
        const progress = subscription.player._state.resource.playbackDuration;

        //Almacena la información del servidor
        const reproductionQueue = client.reproductionQueues[message.guild.id];

        //Almacena la duración de la pista
        const total = reproductionQueue.tracks[0].meta.length;

        //Calcula el porcentaje de progreso actual
        const percentage = Math.floor((progress * 100) / total);
        
        //Genera una barra de progreso
        let progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
        
        //Asigna la posición del indicador en función del porcentaje
        if (percentage <= 10) progressBar[0] = '🔘';
        else if (percentage > 10) progressBar[percentage.toString().slice(0, 1)] = '🔘';

        //Requiere librería para el color
        const randomColor = require('randomcolor');
        
        //Envía el mensaje con el resultado
        message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(randomColor())
            .setAuthor({ name: 'Ahora mismo:', iconURL: 'attachment://dj.png' })
            .setDescription(`[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})\n${progressBar.join('')} ${percentage}%\n\`${client.functions.msToHHMMSS(progress)} / ${client.functions.msToHHMMSS(total)}\`.`)
            .setFooter({ text: await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild), iconURL: client.homeGuild.iconURL({dynamic: true})
        })], files: ['./resources/images/dj.png'] });

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'nowplaying',
    aliases: ['np']
};

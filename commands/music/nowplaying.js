exports.run = async (client, message, args, command, commandConfig) => {
    
    //!nowplaying

    try {

        //Almacena librerías necesarios para manejar conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Obtiene la conexión de voz actual
        let connection = await getVoiceConnection(message.guild.id);

        //Comprueba si el bot está conectado
        if (!connection) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está conectado a ningún canal.`)
        ]});

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;

        //Comprueba si el bot ya estaba pausado
        if (!subscription || subscription.player.state.status === 'idle') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está vacía.`)
        ]});

        //Almacena el objeto de cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];
        
        //Almacena el progreso actual de la pista
        const progress = subscription.player._state.resource.playbackDuration;

        //Almacena la duración de la pista
        const total = reproductionQueue.tracks[0].meta.length;

        //Calcula el porcentaje de progreso actual
        const percentage = Math.floor((progress * 100) / total);
        
        //Genera una barra de progreso
        let progressBar = ['▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬', '▬'];
        
        //Asigna la posición del indicador en función del porcentaje
        if (percentage <= 10) progressBar[0] = '🔘';
        else if (percentage > 10) progressBar[percentage.toString().slice(0, 1)] = '🔘';

        //Requiere librerías para formato
        const moment = require('moment');
        const randomColor = require('randomcolor');
        
        //Envía el mensaje con el resultado
        message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(randomColor())
            .setAuthor({ name: 'Ahora mismo:', iconURL: 'attachment://dj.png' })
            .setDescription(`[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})\n${progressBar.join('')} ${percentage}%\n\`${moment().startOf('day').milliseconds(progress).format('H:mm:ss')} / ${moment().startOf('day').milliseconds(total).format('HH:mm:ss')}\``)
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

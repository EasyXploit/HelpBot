exports.run = async (client, message, args, command, commandConfig) => {

    //!playskip (URL de YouTube | término)

    try {

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Comprueba si el bot está conectado
        if (!connection) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está conectado a ningún canal.`)
        ]});

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)
        ]});

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;

        //Comprueba si el bot no tiene reproducción
        if (!subscription ||subscription.player.state.status === 'idle') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está vacía.`)
        ]});

        //Almacena el canal de voz del miembro
        const voiceChannel = message.member.voice.channel;

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable || voiceChannel.id === message.guild.afkChannel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para hablar en \`${voiceChannel.name}\`.`)
        ]});

        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'playskip', 0)) {

            //Envía un mensaje de confirmación de la búsqueda
            message.channel.send({ content: `🔎 | Buscando \`${args.join(` `)}\` ...` });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            const resultFound = await require('../../utils/voiceSubsystem/fetchResource.js').run(client, args, message, 'stream', args.join(' '));

            //No continua si no se ha conseguido crear
            if (resultFound !== true) return;

            //Almacena la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Obtiene el último ítem de la cola
            let toMove = reproductionQueue.tracks[reproductionQueue.tracks.length - 1];
            
            //Elimina el item de la cola
            reproductionQueue.tracks.splice(reproductionQueue.tracks.length - 1, 1);
            
            //Lo vuelve a introducir en la segunda posición
            reproductionQueue.tracks.splice(1, 0, toMove);

            //Para el reproductor
            subscription.player.stop();

            //Manda un mensaje de confirmación
            await message.channel.send({ content: '⏭ | Canción omitida' });

        };


    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'playskip',
    aliases: ['ps']
};

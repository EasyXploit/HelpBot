exports.run = async (client, message, args, command, commandConfig) => {

    //!replay

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

        //Comprueba si el bot no tiene reproductor suscrito o este se encuentra inactivo
        if (!subscription || subscription.player.state.status === 'idle') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está vacía.`)]
        });

        //Almacena el canal de voz del miembro
        const voiceChannel = message.member.voice.channel;

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable || voiceChannel.id === message.guild.afkChannel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para hablar en \`${voiceChannel.name}\`.`)
        ]});

        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'replay')) {

            //Almacena la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Sube la pista a la cola en el primer puesto y hace skip
            await reproductionQueue.tracks.splice(1, 0, reproductionQueue.tracks[0]);
            await player.stop();
            
            //Manda un mensaje de confirmación
            await message.channel.send({ content: `${client.customEmojis.greenTick} | La pista se volverá a reproducir` });
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'replay',
    aliases: ['rp']
};

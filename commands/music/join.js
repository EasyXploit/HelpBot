exports.run = async (client, message, args, command, commandConfig) => {
    
    //!join

    try {

        //Almacena el canal de voz del miembro
        const voiceChannel = message.member.voice.channel;

        //Comprueba si el miembro está en un canal de voz
        if (!voiceChannel) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`)
        ]});

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable || voiceChannel.id === message.guild.afkChannel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para hablar en \`${voiceChannel.name}\`.`)
        ]});

        //Comprueba si el bot tiene prohibido conectarse
        if (client.config.music.forbiddenChannels.includes(voiceChannel.id)) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Tengo prohibido conetarme a \`${voiceChannel.name}\`.`)
        ]});

        //Comprueba si el bot tiene permiso para conectarse
        if (!voiceChannel.joinable) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para unirme a \`${voiceChannel.name}\`.`)
        ]})

        //Comprueba si la sala está llena
        if (voiceChannel.full  && (!message.guild.me.voice  || !message.guild.me.voice.channel)) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El canal de voz \`${voiceChannel.name}\` está lleno.`)
        ]});

        //Almacena librerías necesarios para manejar conexiones de voz
        const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

        //Crea una nueva conexión al canal de miembro
        let connection = await joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

		//Comprueba si debe crear el objeto global de colas
		if (!client.reproductionQueues[message.guild.id]) client.reproductionQueues[message.guild.id] = { boundedTextChannel: null, timeout: null, votes: {}, mode: false, tracks: [] };

        //Almacena el objeto de colas de la guild
		const reproductionQueue = client.reproductionQueues[message.guild.id];
	
		//Almacena el canal del mensaje para vincular los mensajes de reproducción
		reproductionQueue.boundedTextChannel = message.channel;

        //Manda un mensaje de confirmación
        message.channel.send({ content: `📥 | Unido a \`${voiceChannel.name}\` y vinculado a ${message.channel}.` });

        //Si la conexión desaparece
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                //Comprueba si solo se trataba de una reconexión a otro canal, para ignorarlo
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
                ]);
            } catch (error) {//Parece ser una desconexión real de la que no debe recuperarse

                //Aborta la conexión
                connection.destroy();

                //Borra la información de reproducción de la guild
                delete client.reproductionQueues[message.guild.id];
            }
        });

        //Crea un contador para demorar la salida del canal y la destrucción de la cola
        reproductionQueue.timeout = setTimeout(() => {

            //Aborta la conexión
            connection.destroy();

            //Confirma la acción
            message.channel.send({ content: '⏏ | He abandonado el canal' });

            //Borra la información de reproducción del server
            delete client.reproductionQueues[message.guild.id];

        }, client.config.music.maxIdleTime);

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'join',
    aliases: ['j']
};

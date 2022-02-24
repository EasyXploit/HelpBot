exports.run = async (client, message, args, command, commandConfig) => {

    //!play (URL de YouTube | término | nada)

    try {

        //Comprueba si se han introducido argumentos
        if (!args[0]) { //En este caso, "play" funcionará como "resume"

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(message.guild.id);

            //Comprueba si el bot está conectado
            if (!connection || connection._state.status === 'disconnected') return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El bot no está conectado.`)
            ]});

            //Comprueba si el miembro está en el mismo canal que el bot
            if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)
            ]});

            //Almacena el reproductor suscrito
            const subscription = connection._state.subscription;

            //Comprueba si el bot no estaba pausado
            if (!subscription || subscription.player.state.status !== 'paused') return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El bot no está pausado.`)
            ]});

            //Comprueba si es necesaria una votación
            if (await client.functions.testQueuePerms(message, 'pause')) {

                //Reanuda la reproducción y manda un mensaje de confirmación
                await subscription.player.unpause();
                await message.channel.send({ content: `▶ | Cola reanudada` });
            };

        } else { //En este caso, "play" funcionará como "join" y reproducirá/añadirá a la cola

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

            //Envía un mensaje de confirmación de la búsqueda
            message.channel.send({ content: `🔎 | Buscando \`${args.join(` `)}\` ...` });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            const resultFound = await require('../../utils/voiceSubsystem/fetchResource.js').run(client, args, message, 'stream', args.join(' '));

            //No continua si no se ha conseguido crear
            if (resultFound !== true) return;

            //Almacena librerías necesarios para manejar conexiones de voz
            const { getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');

            //Obtiene la conexión de voz actual
            let connection = await getVoiceConnection(message.guild.id);

            //Almacena librerías necesarios para manejar estados de conexiones
            const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            //Si ya había conexión y el reproductor estaba a la espera, solo ejecuta el mediaPlayer
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'idle') return require('../../utils/voiceSubsystem/mediaPlayer.js').run(client, message, connection);

            //Omite si ya hay reproducción en curso
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'playing') return;

            //Crea una nueva conexión al canal de miembro
            connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            //Manda un mensaje de confirmación
            message.channel.send({ content: `📥 | Unido a \`${voiceChannel.name}\` y vinculado a ${message.channel}.` });

            /* //ESTATUS DE LA CONEXIÓN - Depuración

            connection.on(VoiceConnectionStatus.Signalling, () => {
                console.log('La conexión ha entrado en el estado "Obteniendo señal".');
            });

            connection.on(VoiceConnectionStatus.Connecting, () => {
                console.log('La conexión ha entrado en el estado "Conectando".');
            });

            connection.on(VoiceConnectionStatus.Ready, async () => {
                console.log('La conexión ha entrado en el estado "Preparado".');
            });
            */

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

            //Espera un máximo de 5 segundos hasta que la conexión de voz esté lista
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            //Ejecuta el reproductor de medios
            require('../../utils/voiceSubsystem/mediaPlayer.js').run(client, message, connection);
        };

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'play',
    aliases: ['p', 'resume']
};

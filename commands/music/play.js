exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba si se han introducido argumentos
        if (!args[0]) { //En este caso, "play" funcionará como "resume"

            //Comprueba los requisitos previos para el comando
            if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'can-speak'])) return;

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(message.guild.id);

            //Almacena el reproductor suscrito
            const subscription = connection._state.subscription;

            //Comprueba si el bot no estaba pausado
            if (!subscription || subscription.player.state.status !== 'paused') return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El bot no está pausado.`)
            ]});

            //Comprueba si es necesaria una votación
            if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'pause')) {

                //Almacena la información de reproducción de la guild
                const reproductionQueue = client.reproductionQueues[connection.joinConfig.guildId];

                //Si había un timeout de pausa
                if (reproductionQueue.timeout) {

                    //Finalzia el timeout
                    clearTimeout(reproductionQueue.timeout);

                    //Anula la variable dle timeout
                    reproductionQueue.timeout = null;
                };

                //Reanuda la reproducción
                await subscription.player.unpause();

                //Manda un mensaje de confirmación
                await message.channel.send({ content: '▶ | Cola reanudada' });
            };

        } else { //En este caso, "play" funcionará como "join" y reproducirá/añadirá a la cola

            //Comprueba los requisitos previos para el comando
            if (!await require('../../utils/voice/preChecks.js').run(client, message, ['user-connection', 'forbidden-channel', 'can-speak', 'not-afk', 'can-join', 'full-channel'])) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];
            
            //Comprueba si no hay cola y si el miembro está el mismo canal que el bot
            if (reproductionQueue && message.guild.me.voice.channel && message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El reproductor se encuentra en ejecución en otro canal.`)]
            });

            //Envía un mensaje de confirmación de la búsqueda
            message.channel.send({ content: `🔎 | Buscando \`${args.join(` `)}\` ...` });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            const resultFound = await require('../../utils/voice/fetchResource.js').run(client, args, message, 'stream', args.join(' '));

            //No continua si no se ha conseguido crear
            if (resultFound !== true) return;

            //Almacena librerías necesarios para manejar conexiones de voz
            const { getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');

            //Obtiene la conexión de voz actual
            let connection = await getVoiceConnection(message.guild.id);

            //Almacena librerías necesarios para manejar estados de conexiones
            const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            //Si ya había conexión y el reproductor estaba a la espera, solo ejecuta el mediaPlayer
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'idle') return require('../../utils/voice/mediaPlayer.js').run(client, message, connection);

            //Omite si ya hay reproducción en curso
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'playing') return;

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Crea una nueva conexión al canal de miembro
            connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

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

            //Espera un máximo de 5 segundos hasta que la conexión de voz esté lista
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            //Ejecuta el reproductor de medios
            require('../../utils/voice/mediaPlayer.js').run(client, message, connection);
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'play',
    aliases: ['p', 'resume']
};

exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Método para obtener la lista de sonidos
        async function getFilenames() {

            //Almacena los nombres originales de los archivos
            let fileNames = client.fs.readdirSync('./media/audios/');

            //Almacena los nombres sin extensión
            let newFileNames = [];
            
            //Para cada archivo, almacena su nombre sin extensión en el array "newFileNames"
            for (let file = 0; file < fileNames.length; file ++) newFileNames.push(fileNames[file].replace('.mp3', ''));

            //Devuelve la lista
            return newFileNames;
        };

        //Si se desea obtener la lista
        if (args[0] === 'list') {

            //Obtiene la lista de nombres de los archivos de sonido
            const soundNames = await getFilenames();

            //Envía una lista con las grabaciones
            message.channel.send({embeds : [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`🎙 ${locale.soundListEmbed.title}`)
                .setDescription(`\`\`\`${soundNames.join('    ')}\`\`\``)
                .setFooter({ text: client.functions.localeParser(locale.soundListEmbed.footer, { prefix: client.config.main.prefix }) })
            ]});

        } else { //Si se desea reproducir una grabación

            //Comprueba los requisitos previos para el comando
            if (!await require('../../utils/voice/preChecks.js').run(client, message, ['user-connection',  'forbidden-channel',  'can-speak', 'not-afk',  'can-join',  'full-channel'])) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Comprueba si no hay cola y si el miembro está el mismo canal que el bot
            if (reproductionQueue && message.guild.me.voice.channelId && message.guild.me.voice.channelId !== message.member.voice.channelId) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyPlaying}.`)]
            });

            //Almacena la selección del usuario
            let selection = args[0];

            //Obtiene la lista de nombres de los archivos de sonido
            const soundNames = await getFilenames();

            //Si no hay selección, se elige una grabación aleatoria
            if (!selection) selection = soundNames[Math.floor(Math.random() * soundNames.length)]

            //Si la grabación no existe, devuelve un error
            if (!soundNames.includes(selection)) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.doesntExist, { recordName: selection })}.`)]
            });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            await require('../../utils/voice/fetchResource.js').run(client, args, message, 'file', selection);

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
            message.channel.send({ content: `📥 | ${client.functions.localeParser(locale.bounded, { voiceChannel: voiceChannel, textChannel: message.channel })}.` });

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
    name: 'sound',
    aliases: ['snd'],
};

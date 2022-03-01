exports.run = async (client, message, args, command, commandConfig) => {
    
    //!sound (nada | término | list)

    try {

        //Método para obtener la lista de sonidos
        async function getFilenames() {

            //Almacena los nombres originales de los archivos
            let fileNames = client.fs.readdirSync('./media/audios/');

            //Almacena los nombres sin extensión
            let newFileNames = [];
            
            //Para cada archivo, almacena su nombre sin extensión en el array "newFileNames"
            for (var file = 0; file < fileNames.length - 1; file++) newFileNames.push(fileNames[file].slice(0, -4));

            //Añade la palabra "zorra" a la lista
            if (fileNames.includes('zorra.mp3')) newFileNames.push('zorra'); //PROVISIONAL (no sé por qué no lo coge de normal)

            //Devuelve la lista
            return newFileNames;
        };

        //Si se desea obtener la lista
        if (args[0] === 'list') {

            //Obtiene la lista de nombres de los archivos de sonido
            const soundNames = await getFilenames();

            //Envía una lista con las grabaciones
            message.channel.send({embeds : [ new client.MessageEmbed()
                .setColor('CCCCCC')
                .setTitle('🎙 Lista de grabaciones')
                .setDescription(`\`\`\`${soundNames.join('    ')}\`\`\`.`)]
            });

        } else { //Si se desea reproducir una grabación

            //Comprueba los requisitos previos para el comando
            if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['user-connection',  'forbidden-channel',  'can-speak',  'can-join',  'full-channel'])) return;

            //Almacena la información del servidor
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Comprueba si no hay cola y si el miembro está el mismo canal que el bot
            if (reproductionQueue && message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} El reproductor se encuentra en ejecución en otro canal.`)]
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
                .setDescription(`${client.customEmojis.redTick} **${selection}** no existe.`)]
            });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            await require('../../utils/voiceSubsystem/fetchResource.js').run(client, args, message, 'file', selection);

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
            require('../../utils/voiceSubsystem/mediaPlayer.js').run(client, message, connection);

        };

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'sound',
    aliases: ['snd']
};

exports.run = async (client, interaction, commandConfig, locale) => {

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

        //Almacena la selección proporcionada por el usuario (si la hay)
        let selection = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null;

        //Si se desea obtener la lista
        if (selection === 'list') {

            //Obtiene la lista de nombres de los archivos de sonido
            const soundNames = await getFilenames();

            //Envía una lista con las grabaciones
            interaction.reply({embeds : [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`🎙 ${locale.soundListEmbed.title}`)
                .setDescription(`\`\`\`${soundNames.join('    ')}\`\`\``)
            ]});

        } else { //Si se desea reproducir una grabación

            //Comprueba los requisitos previos para el comando
            if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['user-connection',  'forbidden-channel',  'can-speak', 'not-afk',  'can-join',  'full-channel'])) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Comprueba si no hay cola y si el miembro está el mismo canal que el bot
            if (reproductionQueue && interaction.guild.me.voice.channelId && interaction.guild.me.voice.channelId !== interaction.member.voice.channelId) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyPlaying}.`)
            ], ephemeral: true});

            //Obtiene la lista de nombres de los archivos de sonido
            const soundNames = await getFilenames();

            //Si no hay selección, se elige una grabación aleatoria
            if (!selection) selection = soundNames[Math.floor(Math.random() * soundNames.length)]

            //Si la grabación no existe, devuelve un error
            if (!soundNames.includes(selection)) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.doesntExist, { recordName: selection })}.`)
            ], ephemeral: true});

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            await require('../../../utils/voice/fetchResource.js').run(client, interaction, 'file', selection);

            //Almacena librerías necesarios para manejar conexiones de voz
            const { getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');

            //Obtiene la conexión de voz actual
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena librerías necesarios para manejar estados de conexiones
            const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            //Manda un mensaje de notificación de la carga
            interaction.reply({ content: `⌛ | ${client.functions.localeParser(locale.loadingFile, { fileName: `${selection}.mp3` })}.` });

            //Si ya había conexión y el reproductor estaba a la espera, solo ejecuta el mediaPlayer
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'idle') return require('../../../utils/voice/mediaPlayer.js').run(client, interaction, connection);

            //Omite si ya hay reproducción en curso
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'playing') return;

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Crea una nueva conexión al canal de miembro
            connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            //Almacena el canal de texto de la interacción
            const interactionChannel = await client.functions.fetchChannel(interaction.channelId);

            //Manda un mensaje de confirmación
            interactionChannel.send({ content: `📥 | ${client.functions.localeParser(locale.bounded, { voiceChannel: voiceChannel, textChannel: interactionChannel })}.` });

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
                    delete client.reproductionQueues[interaction.guild.id];
                }
            });

            //Espera un máximo de 5 segundos hasta que la conexión de voz esté lista
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            //Ejecuta el reproductor de medios
            require('../../../utils/voice/mediaPlayer.js').run(client, interaction, connection);
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'selection',
                type: 'STRING',
                required: false
            }
        ]
    }
};

exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Almacena el argumento proporcionado por el usuario (si lo hay)
        const argument = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null;

        //Comprueba si se han introducido argumentos
        if (!argument) { //En este caso, "play" funcionará como "resume"

            //Comprueba los requisitos previos para el comando
            if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected', 'same-channel', 'can-speak'])) return;

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena el reproductor suscrito
            const subscription = connection._state.subscription;

            //Comprueba si el bot no estaba pausado
            if (!subscription || subscription.player.state.status !== 'paused') return interaction.reply({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.notPaused}.`)
            ], ephemeral: true});

            //Comprueba si es necesaria una votación
            if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'pause')) {

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
                await interaction.reply({ content: `▶ | ${locale.resumed}` });
            };

        } else { //En este caso, "play" funcionará como "join" y reproducirá/añadirá a la cola

            //Comprueba los requisitos previos para el comando
            if (!await client.functions.reproduction.preChecks.run(client, interaction, ['user-connection', 'forbidden-channel', 'can-speak', 'not-afk', 'can-join', 'full-channel'])) return;

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];
            
            //Comprueba si no hay cola y si el miembro está el mismo canal que el bot
            if (reproductionQueue && interaction.guild.me.voice.channel && interaction.guild.me.voice.channel.id !== interaction.member.voice.channel.id) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.unavailable}.`)
            ], ephemeral: true});

            //Envía un mensaje de confirmación de la búsqueda
            interaction.reply({ content: `🔎 | ${await client.functions.utilities.parseLocale.run(locale.searching, { serachTerm: argument })} ...` });

            //Crea el objeto de la cola y almacena si se ha logrado crear o no
            const resultFound = await client.functions.reproduction.fetchResource.run(client, interaction, 'stream', argument);

            //No continua si no se ha conseguido crear
            if (resultFound !== true) return;

            //Almacena librerías necesarios para manejar conexiones de voz
            const { getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');

            //Obtiene la conexión de voz actual
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena librerías necesarios para manejar estados de conexiones
            const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            //Si ya había conexión y el reproductor estaba a la espera, solo ejecuta el mediaPlayer
            if (connection && connection._state.subscription && connection._state.subscription.player.state.status === 'idle') return await client.functions.reproduction.mediaPlayer.run(client, interaction, connection);

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
            const interactionChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);

            //Manda un mensaje de confirmación (si procede)
            if (!interaction.guild.me.voice.channel) interactionChannel.send({ content: `📥 | ${await client.functions.utilities.parseLocale.run(locale.bounded, { voiceChannel: voiceChannel, textChannel: interactionChannel })}.` });

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
            await client.functions.reproduction.mediaPlayer.run(client, interaction, connection);
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'search',
                type: 'STRING',
                required: false
            }
        ]
    }
};

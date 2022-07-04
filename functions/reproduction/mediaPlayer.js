//Función para reproducir pistas de audio
exports.run = async (client, interaction, connection) => {

    try {

        //Almacena las traducciones
        const locale = client.locale.functions.reproduction.mediaPlayer;

        //Función para reproducir
        async function mediaPlayer(connection) {

            //Almacena la información de reproducción de la guild
            const reproductionQueue = client.reproductionQueues[connection.joinConfig.guildId];

            //Almacena la posición a reproducir de la cola, y la aleatoriza si así se ha especificado
            let toPlay = reproductionQueue && reproductionQueue.mode === 'shuffle' ? Math.floor(Math.random() * (reproductionQueue.tracks.length - 1)) : 0;

            //Crea un nuevo reproductor de audio
            const { createAudioPlayer } = require('@discordjs/voice');
            const player = createAudioPlayer();

            //Almacena la utilizad para examinar el estado del reproductor
            const { AudioPlayerStatus } = require('@discordjs/voice');

            //Si el reproductor entra en estado de inactividad
            player.on(AudioPlayerStatus.Idle, () => {

                //Elimina de la cola la pista actual
                if (reproductionQueue.mode === 'shuffle') { //Si el modo aleatorio está activado

                    //Elimina la pista de la cola
                    reproductionQueue.tracks.splice(toPlay, 1);

                } else if (reproductionQueue.mode === 'loopqueue') { //Si el modo de cola en bucle está activado

                    //Vuelve a subir la pista al final de la cola
                    reproductionQueue.tracks.push(reproductionQueue.tracks[0]);

                    //Quita el primer elemento de la cola
                    reproductionQueue.tracks.shift();

                } else if (!reproductionQueue.mode) {

                    //Quita el primer elemento de la cola
                    reproductionQueue.tracks.shift();
                };

                //Si queda algo en la cola
                if (reproductionQueue.tracks[0]) mediaPlayer(connection); //Vuelve a cargar la función de reproducción
                else { //O abandona el canal y borra la cola

                    //Manda un mensaje de abandono
                    reproductionQueue.boundedTextChannel.send({ content: `⏹ | ${locale.finishedReproduction}` });

                    //Crea un contador para demorar la salida del canal y la destrucción de la cola
                    reproductionQueue.timeout = setTimeout(async () => {

                        //Método para obtener conexiones de voz
                        const { getVoiceConnection } = require('@discordjs/voice');

                        //Almacena la conexión de voz del bot (si tiene)
                        const actualConnection = await getVoiceConnection(interaction.guild.id);

                        //Si la conexión no estaba destruida
                        if (actualConnection && actualConnection.state.status !== 'Destroyed') {

                            //Aborta la conexión
                            actualConnection.destroy();

                            //Confirma la acción
                            reproductionQueue.boundedTextChannel.send({ content: `⏏ | ${locale.channelLeave}` });
                        };

                        //Borra la información de reproducción del server
                        delete client.reproductionQueues[interaction.guild.id];

                    }, client.config.music.maxIdleTime);
                };
            });

            //En el caso de que el reproductor genere un error
            player.on('error', error => {

                //Envía el error por la consola
                console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);

                //Envía un mensaje de error al canal vinculado
                reproductionQueue.boundedTextChannel.send({ content: `${client.customEmojis.redTick} | ${locale.errorAndSkip}.` });
            });

            //Vacía el timeout de desconexión por inactividad
            if (reproductionQueue.timeout) {
                clearTimeout(reproductionQueue.timeout);
                reproductionQueue.timeout = null;
            };

            //Almacena la utilidad para generar recursos de audio
            const { createAudioResource } = require('@discordjs/voice');

            //Reproduce la pista
            if (reproductionQueue.tracks[toPlay].type === 'stream') { //Si es un streaming de internet

                try {

                    //Obtiene el streaming desde YouTube
                    const playdl = require('play-dl');
                    const stream = await playdl.stream(reproductionQueue.tracks[toPlay].meta.location, { seek : reproductionQueue.tracks[toPlay].meta.seekTo || 0 });

                    //Crea el recurso y lo reproduce en el player
                    await player.play(createAudioResource(stream.stream, { inputType: stream.type }));

                } catch (error) {

                    //Notifica si el error se debe a uns restricción de edad por falta de cookies
                    if (error.toString().includes('Sign in to confirm your age')) {

                        //Elimina de la cola la pista actual
                        if (reproductionQueue.mode === 'shuffle') { //Si el modo aleatorio está activado

                            //Elimina la pista de la cola
                            reproductionQueue.tracks.splice(toPlay, 1);

                        } else {

                            //Quita el primer elemento de la cola
                            reproductionQueue.tracks.shift();
                        };

                        //Si queda algo en la cola
                        if (reproductionQueue.tracks[0]) return mediaPlayer(connection); //Vuelve a cargar la función de reproducción
                        else { //O abandona el canal y borra la cola

                            //Manda un mensaje de abandono
                            reproductionQueue.boundedTextChannel.send({ content: `⏹ | ${locale.finishedReproduction}` });

                            //Crea un contador para demorar la salida del canal y la destrucción de la cola
                            return reproductionQueue.timeout = setTimeout(async () => {

                                //Método para obtener conexiones de voz
                                const { getVoiceConnection } = require('@discordjs/voice');

                                //Almacena la conexión de voz del bot (si tiene)
                                const actualConnection = await getVoiceConnection(interaction.guild.id);

                                //Si la conexión no estaba destruida
                                if (actualConnection && actualConnection.state.status !== 'Destroyed') {

                                    //Aborta la conexión
                                    actualConnection.destroy();

                                    //Confirma la acción
                                    reproductionQueue.boundedTextChannel.send({ content: `⏏ | ${locale.channelLeave}` });
                                };

                                //Borra la información de reproducción del server
                                delete client.reproductionQueues[interaction.guild.id];

                            }, client.config.music.maxIdleTime);
                        };
                    };
                };

            } else if (['mp3', 'ogg'].includes(reproductionQueue.tracks[toPlay].type)) { //Si es un archivo local

                //Almacena el formato del audio elegido
                const fileFormat = client.db.audios[reproductionQueue.tracks[toPlay].meta.title].format;

                //Crea el recurso a partir de un medio local
                let resource = createAudioResource(client.fs.createReadStream(`storage/audios/${reproductionQueue.tracks[toPlay].meta.title}.${fileFormat}`));

                //Reproduce el recurso en el player
                await player.play(resource);
            };
            
            //Suscribe el reproductor a la conexión
            connection.subscribe(player);
            
            //Almacena la información de la entrada de la cola
            let info = reproductionQueue.tracks[toPlay];

            //Almacena una variable para guardar el título de la siguiente pista
            let upNext = locale.nothingUpNext;

            //Calcula cual es el título de la siguiente pista, si es que hay
            if (reproductionQueue.tracks[1]) {
                if (reproductionQueue.mode === 'shuffle') upNext = locale.random; //Caso aleatorio
                else if (reproductionQueue.mode === 'loopsingle') upNext = `[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})`; //Caso loopsingle
                else upNext = `[${reproductionQueue.tracks[1].meta.title}](${reproductionQueue.tracks[1].meta.location})`; //Caso normal / loopqueue
            };

            //Herramienta para generar colores aleatorios
            const randomColor = require('randomcolor');

            //Envía un mensaje de confirmación con la info. de la pista en reproducción (sólo si no hay seek)
            if (!info.meta.seekTo) reproductionQueue.boundedTextChannel.send({ embeds: [new client.MessageEmbed()
                .setColor(randomColor())
                .setThumbnail(info.meta.thumbnail)
                .setAuthor({name: `${locale.playingEmbed.authorTitle} 🎶`, iconURL: 'attachment://dj.png'})
                .setDescription(`${info.meta.location.startsWith('http') ? `[${info.meta.title}](${info.meta.location})` : `${locale.playingEmbed.localAudio}: \`${info.meta.title}\``}\n\n● **${locale.playingEmbed.author}:** ${info.meta.author}\n● **${locale.playingEmbed.duration}:** \`${await client.functions.utilities.msToTime.run(client, info.meta.length)}\``)
                .addField(`${locale.playingEmbed.requestedBy}:`, `<@${reproductionQueue.tracks[toPlay].requesterId}>`, true)
                .addField(`${locale.playingEmbed.upNext}:`, upNext, true)
                .setFooter({text: await client.functions.reproduction.getFooter.run(client, reproductionQueue.boundedTextChannel.guild) })
            ], files: ['./resources/images/dj.png'] });
        };

        //Reproduce la pista
        mediaPlayer(connection);

    } catch (error) {

        //Se comprueba si el error es provocado por una limitación de API
        if (error.toString().includes('416') || error.toString().includes('429')) client.reproductionQueues[interaction.guild.id].boundedTextChannel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${client.locale.functions.reproduction.mediaPlayer.apiRateLimit}.`)
        ]});

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
        
        console.error(`${new Date().toLocaleString()} 》${client.locale.functions.reproduction.mediaPlayer.error}:`, error.stack);
    };
};

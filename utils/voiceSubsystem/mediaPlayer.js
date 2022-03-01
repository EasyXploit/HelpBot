exports.run = async (client, message, connection) => {

    try {

        //Función para reproducir
        async function mediaPlayer(connection) {

            //Almacena la información de reproducción de la guild
            const reproductionQueue = client.reproductionQueues[connection.joinConfig.guildId];

            //Almacena la posición a reproducir de la cola, y la aleatoriza si así se ha especificado
            let toPlay = reproductionQueue.mode === 'shuffle' ? Math.floor(Math.random() * (reproductionQueue.tracks.length - 1)) : 0;

            //Crea un nuevo reproductor de audio
            const { createAudioPlayer } = require('@discordjs/voice');
            const player = createAudioPlayer();

            //Almacena la utilizad para examinar el estado del reproductor
            const { AudioPlayerStatus } = require('@discordjs/voice');

            //Si el reproductor entra en estado de inactividad
            player.on(AudioPlayerStatus.Idle, () => {

                //console.log('The player has entered the Idle state');

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
                    message.channel.send({ content: '⏹ | Reproducción finalizada' });

                    //Crea un contador para demorar la salida del canal y la destrucción de la cola
                    reproductionQueue.timeout = setTimeout(() => {

                        //Aborta la conexión
                        if (connection.state.status !== 'Destroyed') connection.destroy();

                        //Confirma la acción
                        message.channel.send({ content: '⏏ | He abandonado el canal' });

                        //Borra la información de reproducción del server
                        delete client.reproductionQueues[message.guild.id];

                    }, client.config.music.maxIdleTime);
                };
            });

            //En el caso de que el reproductor genere un error
            player.on('error', error => {

                //Envía el error por la consola
                console.error(`${new Date().toLocaleString()} 》Error: ${error.message}`);

                //Envía un mensaje de error al canal vinculado
                reproductionQueue.boundedTextChannel.send({ content: `${client.customEmojis.redTick} | Ocurrió un error. Se ha omitido esta pista.` });
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

                //Obtiene el streaming desde YouTube
                const playdl = require('play-dl');
                const stream = await playdl.stream(reproductionQueue.tracks[toPlay].meta.location, { seek : reproductionQueue.tracks[toPlay].meta.seekTo || 0 });

                //Crea el recurso y lo reproduce en el player
                await player.play(createAudioResource(stream.stream, { inputType: stream.type }));

            } else if (reproductionQueue.tracks[toPlay].type === 'file') { //Si es un archivo local

                //Crea el recurso a partir de un medio local
                let resource = createAudioResource(client.fs.createReadStream(`media/audios/${reproductionQueue.tracks[toPlay].meta.title}.mp3`));

                //Reproduce el recurso en el player
                await player.play(resource);

            };
            
            //Suscribe el reproductor a la conexión
            connection.subscribe(player);
            
            //Almacena la información de la entrada de la cola
            let info = reproductionQueue.tracks[toPlay];

            //Almacena una variable para guardar el título de la siguiente pista
            let upNext = 'Nada';

            //Calcula cual es el título de la siguiente pista, si es que hay
            if (reproductionQueue.tracks[1]) {
                if (reproductionQueue.mode === 'shuffle') upNext = 'Aleatorio'; //Caso aleatorio
                else if (reproductionQueue.mode === 'loop') upNext = `[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})`; //Caso loop
                else upNext = `[${reproductionQueue.tracks[1].meta.title}](${reproductionQueue.tracks[1].meta.location})`; //Caso normal / loopqueue
            };

            //Herramienta para generar colores aleatorios
            const randomColor = require('randomcolor');

            //Envía un mensaje de confirmación con la info. de la pista en reproducción (sólo si no hay seek)
            if (!info.meta.seekTo) reproductionQueue.boundedTextChannel.send({ embeds: [new client.MessageEmbed()
                .setColor(randomColor())
                .setThumbnail(info.meta.thumbnail)
                .setAuthor({name: 'Reproduciendo 🎶', iconURL: 'attachment://dj.png'})
                .setDescription(`[${info.meta.title}](${info.meta.location})\n\n● **Autor:** \`${info.meta.author}\`\n● **Duración:** \`${client.functions.msToHHMMSS(info.meta.length)}\`.`)
                .addField('Solicitado por:', `<@${reproductionQueue.tracks[toPlay].requesterId}>`, true)
                .addField('Siguiente:', upNext, true)
                .setFooter({text: `${await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild)}`, iconURL: client.homeGuild.iconURL({dynamic: true})})
            ], files: ['./resources/images/dj.png'] });
        };

        //Reproduce la pista
        mediaPlayer(connection);

    } catch (error) {

        //Se comprueba si el error es provocado por una limitación de API
        if (error.toLocaleString().includes('416') || error.toLocaleString().includes('429')) reproductionQueue.boundedTextChannel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Límite de solicitudes a la API de YouTube alcanzado.`)
        ]});

        //Devuelve un error por consola
        console.log(`${new Date().toLocaleString()} 》Error: ${error.stack}`);
    };
};

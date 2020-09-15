exports.run = async (discord, client, resources, message, info, ytdl, moment, randomColor) => {

    try {
        //Función para reproducir
        async function play(connection, message) {
            
            let server = client.servers[message.guild.id];

            let toPlay = 0;

            if (client.servers[message.guild.id].mode === 'shuffle') toPlay = Math.floor(Math.random() * (client.servers[message.guild.id].queue.length - 1));

            try {
                //Reproduce la canción
                client.voiceDispatcher = connection.play(await ytdl(server.queue[toPlay].link), {type: 'opus'});
            } catch (e) {
                console.log(`${new Date().toLocaleString()} 》${e}`);
            };
            
            info = await ytdl.getInfo(server.queue[toPlay].link);
            let details = info.player_response.videoDetails;

            let upNext = `Nada`;

            if (server.queue[1]) {
                if (client.servers[message.guild.id].mode === 'shuffle') {
                    upNext = `Aleatorio`;
                } else if (client.servers[message.guild.id].mode === 'loop') {
                    upNext = `[${server.queue[0].title}](${server.queue[0].link})`;
                } else {
                    upNext = `[${server.queue[1].title}](${server.queue[1].link})`;
                };
            };

            let footer = `© ${new Date().getFullYear()} República Gamer S.L.`;
            if (server.mode) {
                switch (server.mode) {
                    case 'shuffle':
                        footer = footer + ` | 🔀`;
                        break;
                
                    case 'loop':
                        footer = footer + ` | 🔂`;
                        break;

                    case 'loopqueue':
                        footer = footer + ` | 🔁`;
                        break;
                };
            };

            let playingEmbed = new discord.MessageEmbed()
                .setColor(randomColor())
                .setThumbnail(details.thumbnail.thumbnails[3].url)
                .setAuthor(`Reproduciendo 🎶`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription(`[${details.title}](${info.video_url})\n\n● **Autor:** \`${details.author}\`\n● **Duración:** \`${moment().startOf('day').milliseconds(details.lengthSeconds * 1000).format('HH:mm:ss')}\``)
                .addField(`Solicitado por:`, server.queue[toPlay].requestedBy, true)
                .addField(`Siguiente:`, upNext, true)
                .setFooter(footer, resources.server.iconURL());

            //Envía un mensaje de confirmación y elimina de la cola la canción actual
            message.channel.send(playingEmbed);
            
            if (client.servers[message.guild.id].mode === 'shuffle') {
                client.servers[message.guild.id].queue.splice(toPlay, 1);
            } else if (client.servers[message.guild.id].mode === 'loopqueue') {
                //Genera la información de la cola
                let newQueueItem = {
                    link: server.nowplaying.link,
                    title: server.nowplaying.title,
                    duration: server.nowplaying.duration,
                    requestedBy: server.nowplaying.requestedBy
                };

                //Sube la canción a la cola
                client.servers[message.guild.id].queue.push(newQueueItem);

                //Quita el primer elemento de la cola
                server.queue.shift();
            } else if (!client.servers[message.guild.id].mode) {
                //Quita el primer elemento de la cola
                server.queue.shift();
            };


            //Actualiza nowplaying
            server.nowplaying = {
                title: details.title,
                link: info.video_url,
                duration: moment().startOf('day').seconds(details.lengthSeconds).format('H:mm:ss'),
                requestedBy: message.member.displayName
            };

            client.voiceDispatcher.on(`finish`, reason => {

                //Si queda algo en la cola
                if (server.queue[0]) {

                    //Vuelve a cargar la función de reproducción
                    play(client.voiceConnection, message);

                } else {

                    //Manda un mensaje de abandono
                    message.channel.send(`⏏ | Reproducción finalizada`);

                    client.voiceTimeout = setTimeout(() => {
                        //Aborta la conexión
                        connection.disconnect();
                        delete client.servers[message.guild.id];

                        //Cambia el estatus a "DISPONIBLE"
                        client.voiceStatus = true;

                        client.voiceTimeout = null;
                    }, 60000);
                };
            });

            //Se dispara si el dispatcher tiene información de depuración a mostrar
            client.voiceDispatcher.on(`debug`, debug => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher (debug): ${debug}`);
            });

            //Se dispara si ocurre un error durante el streaming
            client.voiceDispatcher.on(`error`, error => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher error: ${error}`);
            });
        }
        play(client.voiceConnection, message);
    } catch (e) {
        console.log(`${new Date().toLocaleString()} 》Error: ${e}`);
    }
}
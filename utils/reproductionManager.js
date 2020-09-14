exports.run = async (discord, fs, client, resources, message, info, ytdl, moment, randomColor) => {

    try {
        //Función para reproducir
        async function play(connection, message) {
            
            let server = client.servers[message.guild.id];

            let toPlay = 0;

            if (client.servers[message.guild.id].shuffle === true) toPlay = Math.floor(Math.random() * (client.servers[message.guild.id].queue.length - 1));

            try {
                //Reproduce la canción
                client.voiceDispatcher = connection.play(await ytdl(server.queue[toPlay].link), {type: 'opus'});
            } catch (e) {
                console.log(`${new Date().toLocaleString()} 》${e}`);
            }
            
            info = await ytdl.getInfo(server.queue[toPlay].link);
            let details = info.player_response.videoDetails;

            let durationExcededEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedo reproducir canciones con una duración mayor a 3 horas.`);

            if (details.lengthSeconds > 10800) return message.channel.send(durationExcededEmbed);

            let upNext = `Nada`;

            if (server.queue[1]) {
                if (client.servers[message.guild.id].shuffle === true) {
                    upNext = `Aleatorio`;
                } else if (client.servers[message.guild.id].shuffle === false) {
                    upNext = `[${server.queue[1].title}](${server.queue[1].link})`;
                }
            };

            let playingEmbed = new discord.MessageEmbed()
                .setColor(randomColor())
                .setThumbnail(details.thumbnail.thumbnails[3].url)
                .setAuthor(`Reproduciendo 🎶`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription(`[${details.title}](${info.video_url})\n\n● **Autor:** \`${details.author}\`\n● **Duración:** \`${moment().startOf('day').milliseconds(details.lengthSeconds * 1000).format('HH:mm:ss')}\``)
                .addField(`Solicitado por:`, server.queue[toPlay].requestedBy, true)
                .addField(`Siguiente:`, upNext, true)
                .setFooter(`© ${new Date().getFullYear()} República Gamer S.L. | BETA Pública`, resources.server.iconURL());

            //Ajusta el bitrate del oncoder de Opus actual
            //connection.player.setBitrate(96);

            //Envía un mensaje de confirmación y elimina de la cola la canción actual
            message.channel.send(playingEmbed);
            
            if (client.servers[message.guild.id].shuffle === true) {
                client.servers[message.guild.id].queue.splice(toPlay, 1);
            } else if (client.servers[message.guild.id].shuffle === false) {
                server.queue.shift();
            } else {
                return message.channel.send(`Error`);
            }


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

                    //Aborta la conexión
                    connection.disconnect();
                    delete client.servers[message.guild.id];

                    //Cambia el estatus a "DISPONIBLE"
                    client.voiceStatus = true;
                }
            })

            //Se dispara si el dispatcher tiene información de depuración a mostrar
            client.voiceDispatcher.on(`debug`, debug => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher (debug): ${debug}`)
            });

            //Se dispara si ocurre un error durante el streaming
            client.voiceDispatcher.on(`error`, error => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher error: ${error}`)
            });
        }
        play(client.voiceConnection, message)
    } catch (e) {
        console.log(`${new Date().toLocaleString()} 》Error: ${e}`)
    }
}
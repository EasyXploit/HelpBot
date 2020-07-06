exports.run = async (discord, bot, resources, message, info, ytdl, moment, randomColor) => {

    try {
        //Función para reproducir
        async function play(connection, message) {
            
            let server = bot.servers[message.guild.id];

            let toPlay = 0;

            if (bot.servers[message.guild.id].shuffle === true) toPlay = Math.floor(Math.random() * (bot.servers[message.guild.id].queue.length - 1));

            try {
                //Reproduce la canción
                bot.voiceDispatcher = connection.play(await ytdl(server.queue[toPlay].link), {type: 'opus'});
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
                if (bot.servers[message.guild.id].shuffle === true) {
                    upNext = `Aleatorio`;
                } else if (bot.servers[message.guild.id].shuffle === false) {
                    upNext = `[${server.queue[1].title}](${server.queue[1].link})`;
                }
            } else {
                upNext = `Nada`;
            }

            let playingEmbed = new discord.MessageEmbed()
                .setColor(randomColor())
                .setThumbnail(details.thumbnail.thumbnails[3].url)
                .setAuthor(`Reproduciendo 🎶`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription(`[${details.title}](${info.video_url})\n\n● **Autor:** \`${details.author}\`\n● **Duración:** \`${moment().startOf('day').seconds(details.lengthSeconds).format('h:mm:ss')}\``)
                .addField(`Solicitado por:`, server.queue[toPlay].requestedBy, true)
                .addField(`Siguiente:`, upNext, true)
                .setFooter(`© 2020 República Gamer S.L. | BETA Pública`, resources.server.iconURL());

            //Ajusta el bitrate del oncoder de Opus actual
            //connection.player.setBitrate(96);

            //Envía un mensaje de confirmación y elimina de la cola la canción actual
            message.channel.send(playingEmbed);
            
            if (bot.servers[message.guild.id].shuffle === true) {
                bot.servers[message.guild.id].queue.splice(toPlay, 1);
            } else if (bot.servers[message.guild.id].shuffle === false) {
                server.queue.shift();
            } else {
                return message.channel.send(`Error`);
            }


            //Actualiza nowplaying
            server.nowplaying = {
                title: details.title,
                link: info.video_url,
                duration: moment().startOf('day').seconds(details.lengthSeconds).format('h:mm:ss'),
                requestedBy: message.member.displayName
            };

            bot.voiceDispatcher.on(`finish`, reason => {

                console.log(`${new Date().toLocaleString()} 》End reason: ${reason}`)

                //Si queda algo en la cola
                if (server.queue[0]) {

                    //Vuelve a cargar la función de reproducción
                    play(bot.voiceConnection, message);

                } else {

                    //Manda un mensaje de abandono
                    message.channel.send(`⏏ | Reproducción finalizada`);

                    //Aborta la conexión
                    connection.disconnect();
                    delete bot.servers[message.guild.id];

                    //Cambia el estatus a "DISPONIBLE"
                    bot.voiceStatus = true;
                }
            })

            //Se dispara cuando el dispatcher comienza a emitir
            bot.voiceDispatcher.on(`start`, () => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher: started`)
            });

            //Se dispara si el dispatcher tiene información de depuración a mostrar
            bot.voiceDispatcher.on(`debug`, debug => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher (debug): ${debug}`)
            });

            //Se dispara si ocurre un error durante el streaming
            bot.voiceDispatcher.on(`error`, error => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher error: ${error}`)
            });
        }
        play(bot.voiceConnection, message)
    } catch (e) {
        console.log(`${new Date().toLocaleString()} 》Error: ${e}`)
    }
}
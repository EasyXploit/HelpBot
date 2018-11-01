exports.run = async (discord, bot, resources, message, info, ytdl, moment, randomColor) => {
    
    try {
        //Función para reproducir
        async function play(connection, message) {
            
            let server = bot.servers[message.guild.id];

            let toPlay = 0;

            if (bot.servers[message.guild.id].shuffle === true) toPlay = Math.floor(Math.random() * (bot.servers[message.guild.id].queue.length - 1));

            //Reproduce la canción
            bot.voiceDispatcher = connection.playStream(ytdl(server.queue[toPlay].link, {
                filter: `audioonly`,
                highWaterMark: 1024 * 1024 * 10
            }));
            
            info = await ytdl.getInfo(server.queue[toPlay].link);

            let durationExcededEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedo reproducir canciones con una duración mayor a 3 horas.`);

            if (info.length_seconds > 10800) return message.channel.send(durationExcededEmbed);

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

            let playingEmbed = new discord.RichEmbed()
                .setColor(randomColor())
                .setThumbnail(info.thumbnail_url.replace("default.jpg", "hqdefault.jpg"))
                .setAuthor(`Reproduciendo 🎶`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription('[' + info.title + '](' + info.video_url + ')\n\n● **Autor:** `' + info.author.name + '`\n● **Duración:** `' + moment().startOf('day').seconds(info.length_seconds).format('H:mm:ss') + '`')
                .addField(`Solicitado por:`, server.queue[toPlay].requestedBy, true)
                .addField(`Siguiente:`, upNext, true)
                .setFooter(`© 2018 República Gamer LLC | BETA Pública`, resources.server.iconURL);

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
                title: info.title,
                link: info.video_url,
                duration: moment().startOf('day').seconds(info.length_seconds).format('H:mm:ss'),
                requestedBy: message.member.displayName
            };

            bot.voiceDispatcher.on(`end`, reason => {

                console.log(`${new Date().toUTCString()} 》End reason: ${reason}`)

                //Si queda algo en la cola
                if (server.queue[0]) {

                    //CÓDIGO PROVISIONAL


                    /*bot.voiceDispatcher = connection.playStream(ytdl(server.queue[0].link, {
                        filter: `audioonly`,
                        highWaterMark: 1024 * 1024 * 10
                    }));*/


                    // ------------------


                    //Vuelve a cargar la función de reproducción
                    play(bot.voiceConnection, message);

                } else {

                    //Manda un mensaje de abandoni
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
                console.log(`${new Date().toUTCString()} 》Dispatcher: started`)
            });

            //Se dispara si el dispatcher tiene información de depuración a mostrar
            bot.voiceDispatcher.on(`debug`, debug => {
                console.log(`${new Date().toUTCString()} 》Dispatcher (debug): ${debug}`)
            });

            //Se dispara si ocurre un error durante el streaming
            bot.voiceDispatcher.on(`error`, error => {
                console.log(`${new Date().toUTCString()} 》Dispatcher error: ${error}`)
            });

            //Evalua si el dispatcher está emitiendo o no
            bot.voiceDispatcher.on(`speaking`, speaking => {
                console.log(`${new Date().toUTCString()} 》Dispatcher speaking: ${speaking}`)
            });
        }
        play(bot.voiceConnection, message)
    } catch (e) {
        console.log(`Error: ${e}`)
    }
}
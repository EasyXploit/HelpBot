exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)

    //!play (URL de YouTube | término | nada)

    try {
        const ytdl = require(`ytdl-core`);
        const moment = require(`moment`);
        var randomColor = require('randomcolor');

        let notAvailableEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${bot.user.id}>.`);

        let noConnectionEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${bot.user.id}> no está conectado a ninguna sala.`);

        //Comprueba si se han introducido argumentos
        if (!args[0]) { //En este caso, "play" funcionará como "resume"

            let notPlayingEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No hay ninguna canción en cola/reproducción.`);

            let notPausedEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} El bot no está pausado.`);

            //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
            if (!message.guild.voiceConnection) return message.channel.send(notPlayingEmbed);

            //Comprueba si el miembro está en un canal de voz
            let voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) return message.channel.send(notAvailableEmbed);

            //Comprueba si el miembro está en el mismo canal que el bot
            if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notAvailableEmbed);

            //Comprueba si la reproducción no está pausada
            if (!bot.voiceDispatcher.paused) return message.channel.send(notPausedEmbed);

            let noTalkPermissionEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

            //Reanuda la reproducción y manda un mensaje de confirmación
            bot.voiceDispatcher.resume();
            message.channel.send(`▶ | Cola reanudada`);

        } else if (args[0]) { //En este caso, "play" funcionará como "join" y reproducirá/añadirá a la cola

            let noChannelEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

            let noCorrectSyntaxEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'play (URL de YouTube | término | nada)`');
            
            let noTalkPermissionEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

            //Comprueba si el miembro está en un canal de voz
            let voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

            //Datos de la canción a reproducir
            let info;
            
            //Función para almacenar la información
            async function reproduction(query) {
                
                //Busca la información
                try {
                    info = await ytdl.getInfo(query);
                } catch (e) {
                    let notFoundEmbed = new discord.RichEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No se ha podido localizar el vídeo.`);
                    return message.channel.send(notFoundEmbed)
                }
                
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

                //Función para comprobar la cola de reproducción
                async function queued(message) {

                    let server = bot.servers[message.guild.id];

                    let queuedEmbed = new discord.RichEmbed()
                        .setColor(randomColor())
                        .setThumbnail(info.thumbnail_url.replace("default.jpg", "hqdefault.jpg"))
                        .setAuthor(`Añadido a la cola 🎶`, `https://i.imgur.com/lvShSwa.png`)
                        .setDescription('[' + info.title + '](' + info.video_url + ')\n\n● **Autor:** `' + info.author.name + '`\n● **Duración:** `' + moment().startOf('day').seconds(info.length_seconds).format('H:mm:ss') + '`')
                        .setFooter(`© 2018 República Gamer LLC | BETA Pública`, resources.server.iconURL);
                    message.channel.send(queuedEmbed);
                }

                //Comprueba si el bot tiene o no una conexión a un canal de voz
                if (!message.guild.voiceConnection) { //Ejecuta esto si no está conectado

                    //Comprueba si la guild tiene una cola de reproducción
                    if (!bot.servers[message.guild.id]) {
                        bot.servers[message.guild.id] = {
                            queue: [],
                            nowplaying: {},
                            shuffle: false
                        }
                    }

                    let noConnectPermissionEmbed = new discord.RichEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No tengo permiso para conectarme a esta sala.`);

                    let noAfkRoomEmbed = new discord.RichEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No puedo unirme al canal de AFK.`);

                    let fullRoomEmbed = new discord.RichEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} La sala está llena.`);

                    //Comprueba si el bot tiene permiso para conectarse
                    if (!voiceChannel.joinable) return message.channel.send(noConnectPermissionEmbed)

                    //Comprueba si la sala es de AFK
                    if (message.member.voiceChannelID === message.guild.afkChannelID) return message.channel.send(noAfkRoomEmbed)

                    //Comprueba la sala está llena
                    if (voiceChannel.full) return message.channel.send(fullRoomEmbed)

                    //Se une al canal de voz donde se encuentra el miembro
                    voiceChannel.join().then(connection => {

                        //Almacena la conexión en una variable global
                        bot.voiceConnection = connection;

                        //Cambia el estatus a "NO DISPONIBLE"
                        bot.voiceStatus = false;

                        //Genera la información de la cola
                        let newQueueItem = {
                            link: info.video_url,
                            title: info.title,
                            duration: moment().startOf('day').seconds(info.length_seconds).format('H:mm:ss'),
                            requestedBy: message.member.displayName
                        };

                        //Sube la canción a la cola
                        bot.servers[message.guild.id].queue.push(newQueueItem);

                        //Ejecuta la función de reproducción
                        play(bot.voiceConnection, message);
                    }).catch(err => console.log(err));
                } else if (message.member.voiceChannelID === message.guild.member(bot.user).voiceChannelID) {
                    //Comprueba si la guild tiene una cola de reproducción
                    if (!bot.servers[message.guild.id]) {
                        bot.servers[message.guild.id] = {
                            queue: [],
                            nowplaying: {},
                            shuffle: false
                        }
                    }
                    //Comprueba si hay algo en reproducción
                    if (!bot.voiceDispatcher) {

                        //Genera la información de la cola
                        let newQueueItem = {
                            link: info.video_url,
                            title: info.title,
                            duration: moment().startOf('day').seconds(info.length_seconds).format('H:mm:ss'),
                            requestedBy: message.member.displayName
                        };

                        //Sube la canción a la cola
                        bot.servers[message.guild.id].queue.push(newQueueItem);

                        //Ejecuta la función de reproducción
                        play(bot.voiceConnection, message);
                    } else {
                        //Genera la información de la cola
                        let newQueueItem = {
                            link: info.video_url,
                            title: info.title,
                            duration: moment().startOf('day').seconds(info.length_seconds).format('H:mm:ss'),
                            requestedBy: message.member.displayName
                        };

                        //Sube la canción a la cola
                        bot.servers[message.guild.id].queue.push(newQueueItem);

                        //Ejecuta la función para mostrar que se ha encolado
                        queued(message);
                    }
                } else {
                    //Hace saber que no estás en el mismo canal que el bot
                    return message.channel.send(notAvailableEmbed);
                }
            }

            //Si se proporciona una URL de YouTube, busca con esa url, de lo contrario buscará la URL mediante tubesearch
            if (args[0].startsWith(`https://www.youtube/watch?v=`)) {
                //Almacena los datos de la canción
                reproduction(args[0]);
            } else {
                const search = require(`tubesearch`);

                //Manda el mensaje "buscando ..."
                message.channel.send('🔎 | Buscando `' + args.join(` `) + '` ...')

                //Realiza la búsqueda
                await search(args.join(` `)).then((results) => {

                    //Almacena el primer resultado que coincida
                    const data = results[0];

                    let noResultsEmbed = new discord.RichEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                    //Comprueba si se han obtenido resultados
                    if (!data) return message.channel.send(noResultsEmbed);
                    
                    //Almacena los datos de la canción
                    reproduction(data.link);
                });
            };
        }
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    const noPrivilegesEmbed = new discord.MessageEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.cache.has(config.botStaff) && !message.member.roles.cache.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)

    //!play (URL de YouTube | término | nada)

    try {

        /* ---- */

        //if(message.guild.voice) message.guild.voice.kick();

        /* ---- */

        const ytdl = require(`ytdl-core-discord`);
        const moment = require(`moment`);
        const randomColor = require('randomcolor');

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${client.user.id}> no está conectado a ninguna sala.`);

        //Comprueba si se han introducido argumentos
        if (!args[0]) { //En este caso, "play" funcionará como "resume"

            let notPlayingEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No hay ninguna canción en cola/reproducción.`);

            let notPausedEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} El bot no está pausado.`);

            //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
            if (!message.guild.voice) return message.channel.send(notPlayingEmbed);

            //Comprueba si el miembro está en un canal de voz
            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(noConnectionEmbed);

            //Comprueba si el miembro está en el mismo canal que el bot
            if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);

            //Comprueba si la reproducción no está pausada
            if (!client.voiceDispatcher.paused) return message.channel.send(notPausedEmbed);

            let noTalkPermissionEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

            //Reanuda la reproducción y manda un mensaje de confirmación
            client.voiceDispatcher.resume();
            message.channel.send(`▶ | Cola reanudada`);

        } else if (args[0]) { //En este caso, "play" funcionará como "join" y reproducirá/añadirá a la cola

            let noChannelEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

            let noCorrectSyntaxEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} La sintaxis de este comando es: \`${config.prefix}play (URL de YouTube | término | nada)\``);
            
            let noTalkPermissionEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

            //Comprueba si el miembro está en un canal de voz
            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)

            //Datos de la canción a reproducir
            let info;
            let details;
            
            //Función para almacenar la información
            async function reproduction(query) {
                
                //Busca la información
                try {
                    info = await ytdl.getInfo(query);
                    details = info.player_response.videoDetails;
                } catch (e) {
                    console.log(e);
                    let notFoundEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No se ha podido localizar el vídeo.`);
                    return message.channel.send(notFoundEmbed)
                }

                //Función para comprobar la cola de reproducción
                async function queued(message) {

                    let queuedEmbed = new discord.MessageEmbed()
                        .setColor(randomColor())
                        .setThumbnail(details.thumbnail.thumbnails[3].url)
                        .setAuthor(`Añadido a la cola 🎶`, `https://i.imgur.com/lvShSwa.png`)
                        .setDescription(`[${details.title}](${info.video_url})\n\n● **Autor:** \`${details.author}\`\n● **Duración:** \`${moment().startOf('day').seconds(details.lengthSeconds).format('H:mm:ss')}\``)
                        .setFooter(`© ${new Date().getFullYear()} República Gamer S.L. | BETA Pública`, resources.server.iconURL());
                    message.channel.send(queuedEmbed);
                }

                //Comprueba si el bot tiene o no una conexión a un canal de voz
                if (!message.guild.voice || !message.guild.voice.channel) { //Ejecuta esto si no está conectado

                    //Comprueba si la guild tiene una cola de reproducción
                    if (!client.servers[message.guild.id]) {
                        client.servers[message.guild.id] = {
                            queue: [],
                            nowplaying: {},
                            shuffle: false,
                            loop: false
                        }
                    }

                    let noConnectPermissionEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No tengo permiso para conectarme a esta sala.`);

                    let noAfkRoomEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No puedo unirme al canal de AFK.`);

                    let fullRoomEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} La sala está llena.`);

                    //Comprueba si el bot tiene permiso para conectarse
                    if (!voiceChannel.joinable) return message.channel.send(noConnectPermissionEmbed)

                    //Comprueba si la sala es de AFK
                    if (message.member.voice.channelID === message.guild.afkChannelID) return message.channel.send(noAfkRoomEmbed)

                    //Comprueba si la sala está llena
                    if (voiceChannel.full) return message.channel.send(fullRoomEmbed)

                    //Se une al canal de voz donde se encuentra el miembro
                    voiceChannel.join().then(connection => {

                        //Almacena la conexión en una variable global
                        client.voiceConnection = connection;

                        //Cambia el estatus a "NO DISPONIBLE"
                        client.voiceStatus = false;

                        //Genera la información de la cola
                        let newQueueItem = {
                            link: info.video_url,
                            title: details.title,
                            duration: moment().startOf('day').seconds(details.lengthSeconds).format('H:mm:ss'),
                            requestedBy: message.member.displayName
                        };

                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.push(newQueueItem);

                        //Ejecuta la función de reproducción
                        require(`../utils/reproductionManager.js`).run(discord, fs, client, resources, message, info, ytdl, moment, randomColor);

                    }).catch(err => console.log(`${new Date().toLocaleString()} 》${err}`));
                } else if (message.member.voice.channelID === message.guild.member(client.user).voice.channelID) {
                    //Comprueba si la guild tiene una cola de reproducción
                    if (!client.servers[message.guild.id]) {
                        client.servers[message.guild.id] = {
                            queue: [],
                            nowplaying: {},
                            shuffle: false,
                            loop: false
                        }
                    }
                    //Comprueba si hay algo en reproducción
                    if (!client.voiceDispatcher) {

                        //Genera la información de la cola
                        let newQueueItem = {
                            link: info.video_url,
                            title: details.title,
                            duration: moment().startOf('day').seconds(details.lengthSeconds).format('H:mm:ss'),
                            requestedBy: message.member.displayName
                        };

                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.push(newQueueItem);

                        //Ejecuta la función de reproducción
                        require(`../utils/reproductionManager.js`).run(discord, client, resources, message, info, ytdl, moment, randomColor);
                    } else {
                        //Genera la información de la cola
                        let newQueueItem = {
                            link: info.video_url,
                            title: details.title,
                            duration: moment().startOf('day').seconds(details.lengthSeconds).format('H:mm:ss'),
                            requestedBy: message.member.displayName
                        };

                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.push(newQueueItem);

                        //Ejecuta la función para mostrar que se ha encolado
                        queued(message);
                    }
                } else {
                    //Hace saber que no estás en el mismo canal que el bot
                    return message.channel.send(notAvailableEmbed);
                }
            }

            //Si se proporciona una URL de YouTube, busca con esa url, de lo contrario buscará la URL mediante tubesearch
            const search = require('youtube-search');
            const keys = require('../keys.json');

            const opts = {
                maxResults: 1,
                key: keys.youtube
            };

            //Manda el mensaje "buscando ..."
            message.channel.send(`🔎 | Buscando \`${args.join(` `)}\` ...`)

            //Realiza la búsqueda
            search(args.join(` `), opts, function(err, result) {
                if(err) return console.log(err);

                let noResultsEmbed = new discord.MessageEmbed()
                    .setColor(resources.red)
                    .setDescription(`${resources.RedTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                //Comprueba si se han obtenido resultados
                if (!result) return message.channel.send(noResultsEmbed);
                
                //Almacena los datos de la canción
                reproduction(result[0].link);
            });
        }
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

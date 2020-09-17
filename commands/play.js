exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //!play (URL de YouTube | término | nada)

    try {

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
            
            let noTalkPermissionEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

            //Comprueba si el miembro está en un canal de voz
            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed);

            //Función para generar el footer
            function getFooter() {
                let footer = `© ${new Date().getFullYear()} República Gamer S.L.`;
                if (client.servers[message.guild.id] && client.servers[message.guild.id].mode) {
                    switch (client.servers[message.guild.id].mode) {
                        case 'shuffle':
                            footer = footer + ` | 🔀`;
                    
                        case 'loop':
                            footer = footer + ` | 🔂`;

                        case 'loopqueue':
                            footer = footer + ` | 🔁`;
                    };
                };
                return footer;
            };
            
            //Función para almacenar la información
            async function reproduction(info, silent) {

                //Comprueba si el bot tiene o no una conexión a un canal de voz
                if (!message.guild.voice  || !message.guild.voice.channel || !client.voiceConnection) { //Ejecuta esto si no está conectado

                    //Comprueba si la guild tiene una cola de reproducción
                    if (!client.servers[message.guild.id]) {
                        client.servers[message.guild.id] = {
                            queue: [],
                            nowplaying: {},
                            mode: false
                        };
                    };

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

                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.push(info);

                        //Ejecuta la función de reproducción
                        require(`../utils/reproductionManager.js`).run(discord, client, resources, message, ytdl, moment, randomColor);

                    }).catch(err => console.log(`${new Date().toLocaleString()} 》${err}`));

                } else if (message.member.voice.channelID === message.guild.member(client.user).voice.channelID) {
                    //Comprueba si la guild tiene una cola de reproducción
                    if (!client.servers[message.guild.id]) {
                        client.servers[message.guild.id] = {
                            queue: [],
                            nowplaying: {},
                            mode: false
                        };
                    };

                    //Comprueba si hay algo en reproducción
                    if (!client.voiceDispatcher || client.voiceTimeout) {
                        //Si hay un timeout, lo quita
                        if (client.voiceTimeout) {
                            clearTimeout(client.voiceTimeout);
                            client.voiceTimeout = null;
                        };

                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.push(info);

                        //Ejecuta la función de reproducción
                        require(`../utils/reproductionManager.js`).run(discord, client, resources, message, ytdl, moment, randomColor);
                    } else {
                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.push(info);

                        if (!silent) {
                            let queuedEmbed = new discord.MessageEmbed()
                                .setColor(randomColor())
                                .setThumbnail(info.thumbnail)
                                .setAuthor(`Añadido a la cola 🎶`, `https://i.imgur.com/lvShSwa.png`)
                                .setDescription(`[${info.title}](${info.link})\n\n● **Autor:** \`${info.author}\`\n● **Duración:** \`${moment().startOf('day').seconds(info.lengthSeconds).format('H:mm:ss')}\``)
                                .setFooter(getFooter(), resources.server.iconURL());

                            message.channel.send(queuedEmbed);
                        };
                    };
                } else {
                    //Hace saber que no estás en el mismo canal que el bot
                    return message.channel.send(notAvailableEmbed);
                };
            };

            async function addPlaylist (string) {
                const ytpl = require('ytpl');
                const playlist = await ytpl(string);

                for (let i = 0; i < playlist.items.length; i++) {
                    if (playlist.items[i].title === '[Private video]' || resources.hmsToSeconds(playlist.items[i].duration) > 10800) delete playlist.items[i];
                };

                for (let i = 0; i < playlist.items.length; i++) {
                    let result = playlist.items[i];
                    if (!result) continue;

                    let info = {
                        link: result.url,
                        title: result.title,
                        lengthSeconds: resources.hmsToSeconds(result.duration),
                        author: result.author.name,
                        thumbnail: result.thumbnail,
                        requestedBy: message.member.displayName
                    };

                    //Sube la canción a la cola
                    if (i == 0) {
                        let playlistEmbed = new discord.MessageEmbed()
                            .setColor(randomColor())
                            .setAuthor(`Playlist añadida a la cola 🎶`, `https://i.imgur.com/lvShSwa.png`)
                            .setDescription(`[${playlist.title}](${playlist.url})\n\n● **Autor:** \`${playlist.author.name}\`\n● **Pistas:** \`${playlist.total_items}\``)
                            .addField(`Solicitado por:`, message.member.displayName, true)
                            .setFooter(getFooter(), resources.server.iconURL());

                        message.channel.send(playlistEmbed);

                        reproduction(info, true);
                    } else {
                        client.servers[message.guild.id].queue.push(info);
                    };
                };
            };

            //Manda el mensaje "buscando ..."
            message.channel.send(`🔎 | Buscando \`${args.join(` `)}\` ...`);

            if (args[0].startsWith('http')) {
                if (args[0].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)) {
                    addPlaylist(args[0]);
                } else {
                    let yt_info = await ytdl.getInfo(args[0]);
                    let details = yt_info.player_response.videoDetails;

                    let info = {
                        link: yt_info.video_url,
                        title: details.title,
                        lengthSeconds: details.lengthSeconds,
                        author: details.author,
                        thumbnail: details.thumbnail.thumbnails[3].url,
                        requestedBy: message.member.displayName
                    };

                    reproduction(info);
                };
            } else {
                //Almacena el motor de búsqueda
                const search = require('ytsr');

                //Realiza la búsqueda
                await search(args.join(` `), {limit: 10}).then(async result => {
                    const results = result.items;

                    let noResultsEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                    //Comprueba si se han obtenido resultados
                    if (!results) return message.channel.send(noResultsEmbed);

                    if (results.length == 1) {

                        let info = {
                            link: results[0].link,
                            title: results[0].title,
                            lengthSeconds: resources.hmsToSeconds(results[0].duration),
                            author: results[0].author.name,
                            thumbnail: results[0].thumbnail,
                            requestedBy: message.member.displayName
                        };

                        reproduction(info);
                    } else {
                        let formattedResults = '';
                        let pointer = 1;
                        let asociatedPositions = {};
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].type === 'playlist' || (results[i].type === 'video' && results[i].duration && results[i].title !== '[Private video]' && resources.hmsToSeconds(results[i].duration) < 10800)) {
                                asociatedPositions[pointer] = i;
                                let title = results[i].title;
                                if (title.length > 40) title = `${title.slice(0, 40)} ...`;
                                if (results[i].type === 'playlist') {
                                    formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].link}) | \`${results[i].type}\``;
                                } else {
                                    formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].link}) | \`${results[i].duration}\``;
                                };
                                pointer ++;
                            };
                        };

                        let resultsEmbed = new discord.MessageEmbed()
                            .setColor(randomColor())
                            .setAuthor(`Elige una canción 🎶`, `https://i.imgur.com/lvShSwa.png`)
                            .setDescription(formattedResults)
                            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());

                        await message.channel.send(resultsEmbed).then(async msg => {
                            await msg.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 60000}).then(async collected => {
                                let option = collected.first().content;
                                collected.first().delete();
                                option = parseInt(option);

                                let incorrectOptionEmbed = new discord.MessageEmbed()
                                    .setColor(resources.red)
                                    .setDescription(`${resources.RedTick} Debes escoger una canción de la lista.`);

                                if (isNaN(option) || option < 1 || option > pointer - 1) return message.channel.send(incorrectOptionEmbed);

                                option = asociatedPositions[option];

                                await msg.delete();

                                if (results[option].type === 'playlist') {
                                    addPlaylist(results[option].link);
                                } else if (results[option].type === 'video') {
                                    let info = {
                                        link: results[option].link,
                                        title: results[option].title,
                                        lengthSeconds: resources.hmsToSeconds(results[option].duration),
                                        author: results[option].author.name,
                                        thumbnail: results[option].thumbnail,
                                        requestedBy: message.member.displayName
                                    };
                
                                    reproduction(info);
                                } else {
                                    let incorrectTypeEmbed = new discord.MessageEmbed()
                                        .setColor(resources.red)
                                        .setDescription(`${resources.RedTick} No se puede reproducir este resultado.`);

                                    return message.channel.send(incorrectTypeEmbed);
                                };
                            }).catch(() => msg.delete());
                        });
                    };
                });
            };
        }
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

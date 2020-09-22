exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //!playskip (URL de YouTube | término)

    try {
        const ytdl = require(`ytdl-core-discord`);
        const randomColor = require('randomcolor');
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es: \`${config.prefix}playskip (URL de YouTube | término)\``);
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en reproducción.`);

        let noTalkPermissionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voice) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send(noDispatcherEmbed);

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed);

        //Comprueba si es necesaria una votación
        if (await resources.evaluateDjOrVotes(message, 'playskip', 0)) {
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
            async function reproduction(info, playlist) {

                //Sube la canción a la cola en el primer puesto
                await client.servers[message.guild.id].queue.splice(0, 0, info);
                
                //Omite la reproducción y manda un mensaje de confirmación
                await message.channel.send(`⏭ | Canción omitida`);
                await client.voiceDispatcher.end();
            };

            //Función para prevenir duplicados
            async function preventDupes(link) {
                if (!client.servers[message.guild.id]) return false;
                if (link === client.servers[message.guild.id].nowplaying.link) return true;
                for (let i = 0; i < client.servers[message.guild.id].queue.length; i++) {
                    if (link === client.servers[message.guild.id].queue[i].link) return true;
                };
            };

            //Función para añadir todas las canciones de una playlist a la cola
            async function addPlaylist (string) {

                //Obtiene los metadatos
                const ytpl = require('ytpl');
                const playlist = await ytpl(string);

                //Elimina de la lista todos aquellos resultados que sean privados, directos oo tengan una duración mayor a 3h
                for (let i = 0; i < playlist.items.length; i++) {
                    if (playlist.items[i].title === '[Private video]' || !playlist.items[i].duration || resources.hmsToSeconds(playlist.items[i].duration) > 10800) delete playlist.items[i];
                };

                //Para cada resultado de la lista
                for (let i = 0; i < playlist.items.length; i++) {
                    let result = playlist.items[i];
                    if (!result) continue; //Omite si el resultado fue borrado por el "for" anterior
                
                    //Crea el objeto de la cola
                    let info = {
                        link: result.url,
                        title: result.title,
                        lengthSeconds: resources.hmsToSeconds(result.duration),
                        author: result.author.name,
                        thumbnail: result.thumbnail,
                        requestedBy: message.member.displayName,
                        requestedById: message.member.id
                    };

                    //Comprueba si es un duplicado
                    if (client.musicConfig.preventDuplicates && await preventDupes(info.link)) continue;

                    //Sube la canción a la cola en la posición que marca el contador
                    if (i == 0) {
                        //Notifica la playlist y comienza a reproducirla/añadirla a la cola
                        let playlistEmbed = new discord.MessageEmbed()
                            .setColor(randomColor())
                            .setAuthor(`Playlist añadida a la cola 🎶`, `https://i.imgur.com/lvShSwa.png`)
                            .setDescription(`[${playlist.title}](${playlist.url})\n\n● **Autor:** \`${playlist.author.name}\`\n● **Pistas:** \`${playlist.total_items}\``)
                            .addField(`Solicitado por:`, message.member.displayName, true)
                            .setFooter(getFooter(), resources.server.iconURL());
        
                        message.channel.send(playlistEmbed);

                        //Llama a la función de reproducción
                        reproduction(info);
                    } else {
                        //Sube la canción a la cola
                        client.servers[message.guild.id].queue.splice(i, 0, info);
                    };
                };
            };

            //Manda el mensaje "buscando ..."
            message.channel.send(`🔎 | Buscando \`${args.join(` `)}\` ...`);

            //Si se proporciona un parámetro de búsqueda, se muestra el menú. Si es una URL, busca los metadatos directamente
            if (args[0].startsWith('http')) {
                if (args[0].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)) {
                    //Si se trata de una URL de Playlist, la maneja directamente
                    addPlaylist(args[0]);
                } else {
                    //Busca los metadatos
                    let yt_info = await ytdl.getInfo(args[0]);

                    //Comprueba si se han obtenido resultados
                    let noResultsEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                    if (!yt_info) return message.channel.send(noResultsEmbed);

                    //Almacena los detalles de la respuesta
                    let details = yt_info.player_response.videoDetails;

                    //Comprueba si el resultado no es un directo o un vídeo privado
                    let unsupportedTypeEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} No se pueden reproducir directos o vídeo privados.`);

                    if (details.isLiveContent || details.isPrivate) return message.channel.send(unsupportedTypeEmbed);

                    //Crea el objeto de la cola
                    let info = {
                        link: yt_info.video_url,
                        title: details.title,
                        lengthSeconds: details.lengthSeconds,
                        author: details.author,
                        thumbnail: details.thumbnail.thumbnails[3].url,
                        requestedBy: message.member.displayName,
                        requestedById: message.member.id
                    };

                    //Comprueba si es un duplicado
                    let duplicatedEmbed = new discord.MessageEmbed()
                        .setColor(resources.red)
                        .setDescription(`${resources.RedTick} Esta canción ya está en la cola.`);

                    if (client.musicConfig.preventDuplicates && await preventDupes(info.link)) return message.channel.send(duplicatedEmbed);

                    //Llama a la función de reproducción
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

                    //Si solo hay un resultado, no muestra menú
                    if (results.length == 1) {

                        //Crea el objeto
                        let info = {
                            link: results[0].link,
                            title: results[0].title,
                            lengthSeconds: resources.hmsToSeconds(results[0].duration),
                            author: results[0].author.name,
                            thumbnail: results[0].thumbnail,
                            requestedBy: message.member.displayName,
                            requestedById: message.member.id
                        };

                        //Comprueba si es un duplicado
                        let duplicatedEmbed = new discord.MessageEmbed()
                            .setColor(resources.red)
                            .setDescription(`${resources.RedTick} Esta canción ya está en la cola.`);

                        if (client.musicConfig.preventDuplicates && await preventDupes(info.link)) return message.channel.send(duplicatedEmbed);

                        //Llama a la función de reproducción
                        reproduction(info);
                    } else {
                        //Si hubo más de un resultado, muestra un menú
                        let formattedResults = ''; //Almacena el string del menú
                        let pointer = 1; //Almacena el puntero que indica el número de resultado en el menú
                        let asociatedPositions = {}; //Asocia la posición del puntero con la posición en la lista de resultados

                        //Para cada resultado, evalúa si ha de ser añadido a la lista
                        for (let i = 0; i < results.length; i++) {

                            //Solo añade el resultado si es una playlist, o un vídeo (que no esté en directo, no sea privado y no sea más largo de 3h)
                            if (results[i].type === 'playlist' || (results[i].type === 'video' && results[i].duration && results[i].title !== '[Private video]' && resources.hmsToSeconds(results[i].duration) < 10800)) {
                                asociatedPositions[pointer] = i; //Crea la asociación puntero-posición
                                let title = results[i].title; //Almacena el título
                                if (title.length > 40) title = `${title.slice(0, 40)} ...`; //Acorta el título si es demasiado largo
                                if (results[i].type === 'playlist') { //Si se trata de una playlist, almacena el string "playlist" en vez de la duración de la pista
                                    formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].link}) | \`${results[i].type}\``;
                                } else { //Si se trata de un vídeo, almacena la duración de la pista en vez de el string "playlist"
                                    formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].link}) | \`${results[i].duration}\``;
                                };
                                pointer ++; //Incremento de puntero
                            };
                        };

                        //Se almacena envía el menú de elección
                        let resultsEmbed = new discord.MessageEmbed()
                            .setColor(randomColor())
                            .setAuthor(`Elige una canción 🎶`, `https://i.imgur.com/lvShSwa.png`)
                            .setDescription(formattedResults)
                            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());

                        //Se espera a que el usuario elija una canción de la lista
                        await message.channel.send(resultsEmbed).then(async msg => {
                            await msg.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 60000}).then(async collected => {
                                let option = collected.first().content; //Almacena la opción elegida
                                collected.first().delete(); //Borra el mensaje de elección
                                option = parseInt(option); //Parsea la opción

                                //Maneja si la elección es errónea
                                let incorrectOptionEmbed = new discord.MessageEmbed()
                                    .setColor(resources.red)
                                    .setDescription(`${resources.RedTick} Debes escoger una canción de la lista.`);

                                if (isNaN(option) || option < 1 || option > pointer - 1) return message.channel.send(incorrectOptionEmbed);

                                //Busca el resultado en la lista de asociaciones en función de la opción elegida
                                option = asociatedPositions[option];

                                //Borra el menú
                                await msg.delete();

                                //Maneja el resultado en función de si es una playlist o un vídeo
                                if (results[option].type === 'playlist') {
                                    addPlaylist(results[option].link); //Maneja la playlist
                                } else if (results[option].type === 'video') {

                                    //Crea el objeto de la cola
                                    let info = {
                                        link: results[option].link,
                                        title: results[option].title,
                                        lengthSeconds: resources.hmsToSeconds(results[option].duration),
                                        author: results[option].author.name,
                                        thumbnail: results[option].thumbnail,
                                        requestedBy: message.member.displayName,
                                        requestedById: message.member.id
                                    };

                                    //Comprueba si es un duplicado
                                    let duplicatedEmbed = new discord.MessageEmbed()
                                        .setColor(resources.red)
                                        .setDescription(`${resources.RedTick} Esta canción ya está en la cola.`);

                                    if (client.musicConfig.preventDuplicates && await preventDupes(info.link)) return message.channel.send(duplicatedEmbed);
                
                                    //Llama a la función de reproducción
                                    reproduction(info);
                                } else {

                                    //Si es un tipo de resultado inesperado, lo maneja y lanza un error
                                    let incorrectTypeEmbed = new discord.MessageEmbed()
                                        .setColor(resources.red)
                                        .setDescription(`${resources.RedTick} No se puede reproducir este resultado.`);

                                    return message.channel.send(incorrectTypeEmbed);
                                };
                            }).catch(() => msg.delete()); //Si el usuario no responde, borra el menú
                        });
                    };
                });
            };
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};

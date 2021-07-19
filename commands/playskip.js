exports.run = async (discord, client, message, args, command) => {

    //!playskip (URL de YouTube | término)

    try {
        const ytdl = require(`ytdl-core-discord`);
        const randomColor = require('randomcolor');
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es: \`${client.config.guild.prefix}playskip (URL de YouTube | término)\``);
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No hay nada en reproducción.`);

        let noTalkPermissionEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para hablar en esta sala.`);
        
        let fullQueueEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está llena.`);

        let fullUserQueueEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No puedes añadir más canciones a la cola.`);
        
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
        if (await client.functions.evaluateDjOrVotes(message, 'playskip', 0)) {
            //Función para generar el footer
            function getFooter() {
                let footer = client.homeGuild.name;
                if (client.queues[message.guild.id] && client.queues[message.guild.id].mode) {
                    switch (client.queues[message.guild.id].mode) {
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

            //Función para generar una entrada de la cola
            async function infoGenerator(data, link, lengthSeconds, thumbnail) {
                return {
                    link: link,
                    title: data.title,
                    lengthSeconds: lengthSeconds || client.functions.hmsToSeconds(data.duration),
                    author: data.author.name,
                    thumbnail: thumbnail || data.bestThumbnail.url,
                    requestedBy: message.member.displayName,
                    requestedById: message.member.id
                };
            };

            //Función para almacenar la información
            async function reproduction(info) {

                //Sube la canción a la cola en el primer puesto
                await client.queues[message.guild.id].queue.splice(0, 0, info);
                
                //Omite la reproducción y manda un mensaje de confirmación
                await message.channel.send(`⏭ | Canción omitida`);
                await client.voiceDispatcher.end();
            };

            //Variable para almacenar la cantidad de dupes
            let dupesCount = 0;

            //Función para prevenir duplicados
            async function preventDupes(link) {
                if (!client.queues[message.guild.id]) return false;
                if (client.queues[message.guild.id].nowplaying && link === client.queues[message.guild.id].nowplaying.link) {
                    dupesCount++;
                    return true;
                };
                for (let i = 0; i < client.queues[message.guild.id].queue.length; i++) {
                    if (link === client.queues[message.guild.id].queue[i].link) {
                        dupesCount++;
                        return true;
                    };
                };
            };

            //Función para comprobar cuantas canciones puede subir un miembro a la cola
            async function authorizedLimit(memberID) {

                //Devuelve false si no hay límite
                if (client.config.music.userQueueLimit === 0) return false;

                //Almacena variables para calcular el límite del miembro y cuantas ha subido
                const authorized = client.config.music.userQueueLimit;
                let submitted = 0;

                //Devuelve el total si aún no hay cola o está vacía
                if (!client.queues[message.guild.id] || client.queues[message.guild.id].queue.length < 1) return authorized;

                //Calcula cuantas canciones tiene el miembro en la cola
                for (let i = 0; i < client.queues[message.guild.id].queue.length; i++) {
                    if (memberID === client.queues[message.guild.id].queue[i].requestedById) submitted++;
                };

                //Devuelve las canciones autorizadas restantes
                return authorized - submitted;
            };

            //Función para añadir todas las canciones de una playlist a la cola
            async function addPlaylist (string) {

                //Obtiene los metadatos
                const ytpl = require('ytpl');
                const playlist = await ytpl(string);

                //Elimina de la lista todos aquellos resultados que sean privados, directos oo tengan una duración mayor a 3h
                for (let i = 0; i < playlist.items.length; i++) {
                    if (playlist.items[i].title === '[Private video]' || !playlist.items[i].duration || client.functions.hmsToSeconds(playlist.items[i].duration) > 10800) delete playlist.items[i];
                };

                //Comprueba si el miembro puede añadir más canciones a la cola
                const authorizedSongs = await authorizedLimit(message.member.id);
                if (authorizedSongs === 0) return message.channel.send(fullUserQueueEmbed);

                //Almacena las canciones restantes
                let remainingSongs = authorizedSongs;

                //Para cada resultado de la lista
                for (let i = 0; i < playlist.items.length; i++) {
                    let result = playlist.items[i];
                    if (!result) continue; //Omite si el resultado fue borrado por el "for" anterior

                    //Crea el objeto de la cola
                    let info = await infoGenerator(result, result.url);

                    //Comprueba si es un duplicado
                    if (client.config.music.preventDuplicates && await preventDupes(info.link)) continue;

                    //Comprueba si la cola de reproducción está llena
                    if (client.config.music.queueLimit !== 0 && client.queues[message.guild.id] && client.queues[message.guild.id].queue.length >= client.config.music.queueLimit) {
                        message.channel.send(fullQueueEmbed);
                        break;
                    };

                    //Calcula si quedan cancionea autorizadas restantes
                    if (remainingSongs === 0) break;
                    remainingSongs--;

                    //Sube la canción a la cola en la posición que marca el contador
                    if (i == 0) {
                        //Notifica la playlist y comienza a reproducirla/añadirla a la cola
                        let playlistEmbed = new discord.MessageEmbed()
                            .setColor(randomColor())
                            .setAuthor(`Playlist añadida a la cola 🎶`, `https://i.imgur.com/lvShSwa.png`)
                            .setDescription(`[${playlist.title}](${playlist.url})\n\n● **Autor:** \`${playlist.author.name}\`\n● **Pistas:** \`${playlist.total_items}\``)
                            .addField(`Solicitado por:`, message.member.displayName, true)
                            .setFooter(getFooter(), client.homeGuild.iconURL());
        
                        message.channel.send(playlistEmbed);

                        //Llama a la función de reproducción
                        reproduction(info);
                    } else {
                        //Sube la canción a la cola
                        client.queues[message.guild.id].queue.splice(i, 0, info);
                    };
                };

                //Si hubieron cancines omitidas, lo advierte
                let unauthorizedSongsEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.orange)
                    .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${playlist.items.length - authorizedSongs}\` canciones por que no puedes añadir más.`);

                if (playlist.items.length > authorizedSongs) message.channel.send(unauthorizedSongsEmbed).then(msg => {msg.delete({timeout: 10000})});

                //Si hubieron cancines omitidas, lo advierte
                let dupesCountEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.orange)
                    .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${dupesCount}\` canciones duplicadas.`);

                if (dupesCount > 0) message.channel.send(dupesCountEmbed).then(msg => {msg.delete({timeout: 10000})});
            };

            //Manda el mensaje "buscando ..."
            message.channel.send(`🔎 | Buscando \`${args.join(` `)}\` ...`);

            //Si se proporciona un parámetro de búsqueda, se muestra el menú. Si es una URL, busca los metadatos directamente
            if (args[0].startsWith('http')) {

                let notSupportedEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.red)
                    .setDescription(`${client.customEmojis.redTick} El bot solo puede reproducir música desde YouTube.`);

                if (!args[0].includes('youtu')) return message.channel.send(notSupportedEmbed);

                if (args[0].match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)) {
                    //Si se trata de una URL de Playlist, la maneja directamente
                    addPlaylist(args[0]);
                } else {
                    //Comprueba si la cola de reproducción está llena
                    if (client.config.music.queueLimit !== 0 && client.queues[message.guild.id] && client.queues[message.guild.id].queue.length >= client.config.music.queueLimit) return message.channel.send(fullQueueEmbed);

                    //Comprueba si el miembro puede añadir más canciones a la cola
                    let authorizedSongs = await authorizedLimit(message.member.id);
                    if (authorizedSongs === 0) return message.channel.send(fullUserQueueEmbed);

                    //Busca los metadatos
                    let yt_info = await ytdl.getInfo(args[0]);

                    //Comprueba si se han obtenido resultados
                    let noResultsEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.red)
                        .setDescription(`${client.customEmojis.redTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                    if (!yt_info) return message.channel.send(noResultsEmbed);

                    //Almacena los detalles de la respuesta
                    let details = yt_info.videoDetails;

                    //Comprueba si el resultado no es un directo o un vídeo privado
                    let unsupportedTypeEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.red)
                        .setDescription(`${client.customEmojis.redTick} No se pueden reproducir directos o vídeo privados.`);

                    if (details.isLiveContent || details.isPrivate) return message.channel.send(unsupportedTypeEmbed);

                    //Crea el objeto de la cola
                    let info = await infoGenerator(details, details.video_url, details.lengthSeconds, details.thumbnails[0].url);

                    //Comprueba si es un duplicado
                    let duplicatedEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.red)
                        .setDescription(`${client.customEmojis.redTick} Esta canción ya está en la cola.`);

                    if (client.config.music.preventDuplicates && await preventDupes(info.link)) return message.channel.send(duplicatedEmbed);

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
                        .setColor(client.colors.red)
                        .setDescription(`${client.customEmojis.redTick} No se ha encontrado ningún resultado que encaje con ${args.join(' ')}.`);

                    //Comprueba si se han obtenido resultados
                    if (!results) return message.channel.send(noResultsEmbed);

                    //Si solo hay un resultado, no muestra menú
                    if (results.length == 1) {

                        //Comprueba si la cola de reproducción está llena
                        if (client.config.music.queueLimit !== 0 && client.queues[message.guild.id] && client.queues[message.guild.id].queue.length >= client.config.music.queueLimit) return message.channel.send(fullQueueEmbed);

                        //Comprueba si el miembro puede añadir más canciones a la cola
                        let authorizedSongs = await authorizedLimit(message.member.id);
                        if (authorizedSongs === 0) return message.channel.send(fullUserQueueEmbed);

                        //Crea el objeto de la cola
                        let info = await infoGenerator(results[0], results[0].url);

                        //Comprueba si es un duplicado
                        let duplicatedEmbed = new discord.MessageEmbed()
                            .setColor(client.colors.red)
                            .setDescription(`${client.customEmojis.redTick} Esta canción ya está en la cola.`);

                        if (client.config.music.preventDuplicates && await preventDupes(info.link)) return message.channel.send(duplicatedEmbed);

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
                            if (results[i].type === 'playlist' || (results[i].type === 'video' && results[i].duration && results[i].title !== '[Private video]' && client.functions.hmsToSeconds(results[i].duration) < 10800)) {
                                asociatedPositions[pointer] = i; //Crea la asociación puntero-posición
                                let title = results[i].title; //Almacena el título
                                title = title.replace('*', '').replace('_', '').replace('|', '').replace('(', '').replace(')', '').replace('[', '').replace(']', ''); //Elimina signos que alteren la forma en la que se muestra la entrada
                                if (title.length > 40) title = `${title.slice(0, 40)} ...`; //Acorta el título si es demasiado largo
                                if (results[i].type === 'playlist') { //Si se trata de una playlist, almacena el string "playlist" en vez de la duración de la pista
                                    formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].url}) | \`${results[i].type}\``;
                                } else { //Si se trata de un vídeo, almacena la duración de la pista en vez de el string "playlist"
                                    formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].url}) | \`${results[i].duration}\``;
                                };
                                pointer ++; //Incremento de puntero
                            };
                        };

                        //Se almacena envía el menú de elección
                        let resultsEmbed = new discord.MessageEmbed()
                            .setColor(randomColor())
                            .setAuthor(`Elige una canción 🎶`, `https://i.imgur.com/lvShSwa.png`)
                            .setDescription(formattedResults);

                        //Se espera a que el miembro elija una canción de la lista
                        await message.channel.send(resultsEmbed).then(async msg => {
                            await msg.channel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 60000}).then(async collected => {
                                let option = collected.first().content; //Almacena la opción elegida
                                collected.first().delete(); //Borra el mensaje de elección
                                option = parseInt(option); //Parsea la opción

                                //Maneja si la elección es errónea
                                let incorrectOptionEmbed = new discord.MessageEmbed()
                                    .setColor(client.colors.red)
                                    .setDescription(`${client.customEmojis.redTick} Debes escoger una canción de la lista.`);

                                if (isNaN(option) || option < 1 || option > pointer - 1) return message.channel.send(incorrectOptionEmbed);

                                //Busca el resultado en la lista de asociaciones en función de la opción elegida
                                option = asociatedPositions[option];

                                //Borra el menú
                                await msg.delete();

                                //Maneja el resultado en función de si es una playlist o un vídeo
                                if (results[option].type === 'playlist') {
                                    addPlaylist(results[option].link); //Maneja la playlist
                                } else if (results[option].type === 'video') {

                                    //Comprueba si la cola de reproducción está llena
                                    if (client.config.music.queueLimit !== 0 && client.queues[message.guild.id] && client.queues[message.guild.id].queue.length >= client.config.music.queueLimit) return message.channel.send(fullQueueEmbed);

                                    //Comprueba si el miembro puede añadir más canciones a la cola
                                    let authorizedSongs = await authorizedLimit(message.member.id);
                                    if (authorizedSongs === 0) return message.channel.send(fullUserQueueEmbed);

                                    //Crea el objeto de la cola
                                    let info = await infoGenerator(results[option], results[option].url);

                                    //Comprueba si es un duplicado
                                    let duplicatedEmbed = new discord.MessageEmbed()
                                        .setColor(client.colors.red)
                                        .setDescription(`${client.customEmojis.redTick} Esta canción ya está en la cola.`);

                                    if (client.config.music.preventDuplicates && await preventDupes(info.link)) return message.channel.send(duplicatedEmbed);
                
                                    //Llama a la función de reproducción
                                    reproduction(info);
                                } else {

                                    //Si es un tipo de resultado inesperado, lo maneja y lanza un error
                                    let incorrectTypeEmbed = new discord.MessageEmbed()
                                        .setColor(client.colors.red)
                                        .setDescription(`${client.customEmojis.redTick} No se puede reproducir este resultado.`);

                                    return message.channel.send(incorrectTypeEmbed);
                                };
                            }).catch(() => msg.delete()); //Si el miembro no responde, borra el menú
                        });
                    };
                });
            };
        };
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    } catch (error) {
    };
};

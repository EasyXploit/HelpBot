exports.run = async (client, reproductionQueue, playlistUrl, authorizedTracks, requestingMember, interaction) => {

    try {

        //Obtiene los metadatos
        const playdl = require('play-dl');
        const playlist = await playdl.playlist_info(playlistUrl);
        const playlistItems = await playlist.all_videos();

        //Almacena las traducciones
		const locale = client.locale.utils.voice.parsePlaylist;

        //Almacena las pistas autorizadas restantes
        let remainingTracks = authorizedTracks;

        //Almacena la cantidad de pistas eliminadas
        let deletedCount = 0;

        //Elimina de la lista todos aquellos resultados que sean privados, directos o tengan una duración mayor a la establecida por la configuración
        for (let index = 0; index < playlistItems.length; index++) {
            if (playlistItems[index].title === '[Private video]' || !playlistItems[index].durationRaw || (client.config.music.maxTrackDuration > 0 && playlistItems[index].durationInSec * 1000 > client.config.music.maxTrackDuration && results[index].durationInSec * 1000 > 0)) {
                delete playlistItems[index];
                deletedCount++;
            };
        };

        //Si hubieron omitidas por que no se podían reproducir o superaron la duración máxima, lo advierte
        if (deletedCount > 0) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${client.functions.localeParser(locale.ignoredTracks, { ignoredCount: deletedCount, duration: client.functions.msToDHHMMSS(client.config.music.maxTrackDuration) })}.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Almacena la cantidad de pistas duplicadas
        let duplicateCount = 0;

        //Para cada resultado de la lista
        for (let index = 0; index < playlistItems.length; index++) {

            //Almacena el resultado actual
            let result = playlistItems[index];

            //Omite si el resultado fue borrado por la anterior ejecución del bucle
            if (!result) continue;

            //Crea el objeto de la cola
            let queueTrackInfo = await require('./addTrack').run(client, reproductionQueue, true, 'stream', requestingMember.id, result, interaction);

            //Continua si es un duplicado y aumenta la cantidad de duplicados
            if (!queueTrackInfo) {
                duplicateCount++;
                continue;
            };

            //Comprueba si la cola de reproducción está llena
            if (client.config.music.queueLimit !== 0 && reproductionQueue.tracks.length >= client.config.music.queueLimit) {
                await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.fullQueue}.`)]
                });
                break;
            };

            //Calcula si quedan pistas autorizadas restantes
            if (remainingTracks === 0) break;
            remainingTracks--;
        };

        //Herramienta para generar colores aleatorios
        const randomColor = require('randomcolor');

        //Notifica la adición de la playlist
        if (duplicateCount !== playlistItems.length) reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(randomColor())
            .setAuthor({name: `${locale.addedPlaylistEmbed.authorTitle} 🎶`, iconURL: 'attachment://dj.png'})
            .setDescription(`[${playlist.title}](${playlist.url})\n\n● **${locale.addedPlaylistEmbed.author}:** \`${playlist.channel.name !== null ? playlist.channel.name : 'YouTube'}\`\n● **${locale.addedPlaylistEmbed.tracks}:** \`${playlistItems.length}\``)
            .addField(`${locale.addedPlaylistEmbed.requestedBy}:`, `${requestingMember}`, true)
            .setFooter({text: await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild) })
        ], files: ['./resources/images/dj.png']});

        //Si hubieron pistas omitidas por que eran duplicadas, lo advierte
        if (duplicateCount > 0) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${client.functions.localeParser(locale.ignoredDuplicates, { ignoredCount: duplicateCount })}.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Si hubieron pistas omitidas por que excedían la cantidad máxima de pistas autorizadas, lo advierte
        if ((playlistItems.length - duplicateCount) > authorizedTracks) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${client.functions.localeParser(locale.ignoredFull, { ignoredCount: playlistItems.length - authorizedTracks })}.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Devuelve true si el total de pistas no eran duplicadas
        if (duplicateCount !== playlistItems.length) return true;

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

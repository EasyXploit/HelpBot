exports.run = async (client, reproductionQueue, playlistUrl, authorizedTracks, requestingMember) => {

    try {

        //Obtiene los metadatos
        const playdl = require('play-dl');
        const playlist = await playdl.playlist_info(playlistUrl);
        const playlistItems = await playlist.all_videos();

        //Almacena las pistas autorizadas restantes
        let remainingTracks = authorizedTracks;

        //Almacena la cantidad de pistas eliminadas
        let deletedCount = 0;

        //Elimina de la lista todos aquellos resultados que sean privados, directos o tengan una duración mayor a la establecida por la configuración
        for (let i = 0; i < playlistItems.length; i++) {
            if (playlistItems[i].title === '[Private video]' || !playlistItems[i].durationRaw || playlistItems[i].durationInSec * 1000 > client.config.music.maxTrackDuration) {
                delete playlistItems[i];
                deletedCount++;
            };
        };

        //Si hubieron omitidas por que no se podían reproducir o superaron la duración máxima, lo advierte
        if (deletedCount > 0) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${deletedCount}\` pistas por que no se podían reproducir o superaron la duración de ${client.functions.msToHHMMSS(client.config.music.maxTrackDuration)}.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Almacena la cantidad de pistas duplicadas
        let duplicateCount = 0;

        //Para cada resultado de la lista
        for (let i = 0; i < playlistItems.length; i++) {

            let result = playlistItems[i];
            if (!result) continue; //Omite si el resultado fue borrado por la anterior ejecución del bucle

            //Crea el objeto de la cola
            let queueTrackInfo = await require('./addTrack').run(client, reproductionQueue, true, 'stream', requestingMember.id, result);

            //Continua si es un duplicado y aumenta la cantidad de duplicados
            if (!queueTrackInfo) {
                duplicateCount++;
                continue;
            };

            //Comprueba si la cola de reproducción está llena
            if (client.config.music.queueLimit !== 0 && reproductionQueue.tracks.length >= client.config.music.queueLimit) {
                await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} La cola de reproducción está llena.`)]
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
            .setAuthor({name: 'Playlist añadida a la cola 🎶', iconURL: 'attachment://dj.png'})
            .setDescription(`[${playlist.title}](${playlist.url})\n\n● **Autor:** \`${playlist.channel.name !== null ? playlist.channel.name : 'YouTube'}\`\n● **Pistas:** \`${playlistItems.length}\``)
            .addField('Solicitado por:', `<@${requestingMember.id}>`, true)
            .setFooter({text: `${await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild)}`, iconURL: reproductionQueue.boundedTextChannel.guild.iconURL({dynamic: true})})
        ], files: ['./resources/images/dj.png']});

        //Si hubieron pistas omitidas por que eran duplicadas, lo advierte
        if (duplicateCount > 0) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${duplicateCount}\` pistas duplicadas.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Si hubieron pistas omitidas por que excedían la cantidad máxima de pistas autorizadas, lo advierte
        if ((playlistItems.length - duplicateCount) > authorizedTracks) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${playlistItems.length - authorizedTracks}\` pistas por que no puedes añadir más.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Devuelve true si el total de pistas no eran duplicadas
        if (duplicateCount !== playlistItems.length) return true;

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};

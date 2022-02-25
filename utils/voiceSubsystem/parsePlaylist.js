exports.run = async (client, reproductionQueue, playlistUrl, authorizedTracks, requestingMember) => {

    try {

        //Obtiene los metadatos
        const ytpl = require('ytpl');
        const playlist = await ytpl(playlistUrl);

        //Almacena las canciones autorizadas restantes
        let remainingTracks = authorizedTracks;

        //Almacena la cantidad de canciones eliminadas
        let deletedCount = 0;

        //Elimina de la lista todos aquellos resultados que sean privados, directos o tengan una duración mayor a la establecida por la configuración
        for (let i = 0; i < playlist.items.length; i++) {
            if (playlist.items[i].title === '[Private video]' || !playlist.items[i].duration || (client.functions.hmsToSeconds(playlist.items[i].duration) * 1000) > client.config.music.maxTrackDuration) {
                delete playlist.items[i];
                deletedCount++;
            };
        };

        //Si hubieron omitidas por que no se podían reproducir o superaron la duración máxima, lo advierte
        if (deletedCount > 0) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${deletedCount}\` canciones por que no se podían reproducir o superaron la duración de ${client.functions.msToHMS(client.config.music.maxTrackDuration)}.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Almacena la cantidad de canciones duplicadas
        let duplicateCount = 0;

        //Para cada resultado de la lista
        for (let i = 0; i < playlist.items.length; i++) {

            let result = playlist.items[i];
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

            //Calcula si quedan canciones autorizadas restantes
            if (remainingTracks === 0) break;
            remainingTracks--;
        };

        //Herramienta para generar colores aleatorios
        const randomColor = require('randomcolor');

        //Notifica la adición de la playlist
        if (duplicateCount !== playlist.items.length) reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(randomColor())
            .setAuthor({name: 'Playlist añadida a la cola 🎶', iconURL: 'attachment://dj.png'})
            .setDescription(`[${playlist.title}](${playlist.url})\n\n● **Autor:** \`${playlist.author ? playlist.author.name : 'YouTube'}\`\n● **Pistas:** \`${playlist.items.length}\``)
            .addField('Solicitado por:', `<@${requestingMember.id}>`, true)
            .setFooter({text: `${await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild)}`, iconURL: reproductionQueue.boundedTextChannel.guild.iconURL({dynamic: true})})
        ], files: ['./resources/images/dj.png']});

        //Si hubieron canciones omitidas por que eran duplicadas, lo advierte
        if (duplicateCount > 0) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${duplicateCount}\` canciones duplicadas.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Si hubieron canciones omitidas por que excedían la cantidad máxima de canciones autorizadas, lo advierte
        if ((playlist.items.length - duplicateCount) > authorizedTracks) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Se han omitido \`${playlist.items.length - authorizedTracks}\` canciones por que no puedes añadir más.`)]
        }).then(msg => {setTimeout(() => msg.delete(), 10000)});

        //Devuelve true si el total de canciones no eran duplicadas
        if (duplicateCount !== playlist.items.length) return true;

    } catch (error) {

        console.log(`${new Date().toLocaleString()} 》Error: ${error.stack}`);
    };
};

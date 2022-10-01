//Función para añadir pistas a la cola de reproducción
exports.run = async (client, reproductionQueue, silentMode, contentType, requesterId, metadata, interaction) => {

    try {

        //Variable que almacena el nuevo objeto de cola
        let newTrack;

        //Renombra el objeto "channel" si existe
        if (metadata.channel) {
            metadata.author = metadata.channel;
            delete metadata.channel;
        };

        //Crea el nuevo objeto de cola en función del tipo de medio
        switch(contentType) {
            case 'stream':
                newTrack = {
                    type: contentType,
                    requesterId: requesterId,
                    meta: {
                        location: metadata.url,
                        title: metadata.title,
                        author: metadata.author.name,
                        length: metadata.durationInSec * 1000,
                        thumbnail: metadata.thumbnails[0].url
                    }
                };
                break;
            case 'mp3':
            case 'opus':
            case 'ogg':
                newTrack = {
                    type: contentType,
                    requesterId: requesterId,
                    meta: {
                        location: metadata.location,
                        title: metadata.title,
                        author: metadata.author,
                        length: metadata.length,
                        thumbnail: metadata.thumbnail
                    }
                };
                break;
        }

        //Variable para saber si la pista está duplicada
        let duplicate = false;

        //Comprueba si es un duplicado y no se puede añadir
        if (client.config.music.preventDuplicates) {

            //Por cada item de la cola, comprueba si su enlace coincide con el proporcionado
            for (let index = 0; index <reproductionQueue.tracks.length; index++) {

                //Si coincide, no continua el bucle
                if (newTrack.meta.location === reproductionQueue.tracks[index].meta.location) {
                    duplicate = true;
                    break;
                };
            };
        };

        //Comprueba si era un duplicado
        if (duplicate) {

            //Devuelve un error si así se desea
            if (!silentMode) await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${client.locale.functions.reproduction.addTrack.actuallyOnQueue}.`)]
            });

        } else {

            //Sube el objeto a la cola y lo devuelve
            await reproductionQueue.tracks.push(newTrack);
            return newTrack;
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

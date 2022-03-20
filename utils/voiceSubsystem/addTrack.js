exports.run = async (client, reproductionQueue, silentMode, contentType, requesterId, metadata) => {

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
            case 'file':
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
            for (let i = 0; i <reproductionQueue.tracks.length; i++) {

                //Si coincide, no continua el bucle
                if (newTrack.meta.location === reproductionQueue.tracks[i].meta.location) {
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
                .setDescription(`${client.customEmojis.orangeTick} Esta pista ya está en la cola.`)]
            });

        } else {

            //Sueb el objeto a la cola y lo devuelve
            await reproductionQueue.tracks.push(newTrack);
            return newTrack;
        };

    } catch (error) {

        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};

exports.run = async (client) => {

    //Traducciones de los timers
    const locale = client.locale.lifecycle.loadTimers;

    //Aborta si los timers están deshabilitados
    if (!client.config.main.timers) return;

    //Aborta si los timers no son un array
    if (!Array.isArray(client.config.timers)) return;

    //Crea un objeto para almacenar la config. de todos los timers
    if (!client.db.timers.sents) client.db.timers.sents = {}

    //Crea un objeto para almacenar el historial de mensajes enviados
    client.db.timers.messages = {}

    //Por cada uno de los timers configurados
    for (const timer of client.config.timers) {

        //Omite si no se ha proporcionado correctamente el ID del canal
        if (!timer.channelId || isNaN(timer.channelId)) continue;

        //Omite si no se ha proporcionado correctamente el intervalo de ejecución
        if (!timer.interval || isNaN(timer.interval) || timer.interval < 60000 || timer.interval > 86400000) continue;

        //Omite si no se han proporcionado correctamente los días de la semana
        if (!timer.weekDays || !Array.isArray(timer.weekDays)) continue;

        //Omite si no se ha proporcionado correctamente un mínimo de mensajes anteriores
        if (!timer.minimumMessagesSinceLast || isNaN(timer.minimumMessagesSinceLast)) continue;

        //Omite si no se ha proporcionado correctamente un valor de mensajes anteriores entre la franja válida
        if (timer.minimumMessagesSinceLast < 1 || timer.minimumMessagesSinceLast > 100) continue;

        //Omite si no se ha proporcionado contenido 
        if (!timer.content) continue;

        //Almacena los días de la semana que será ejecutado
        let effectiveWeekDays = [];

        //Por cada día de la semana proporcionado
        await timer.weekDays.forEach(day => {

            //Comprueba si es válido, correlaciona su valor con los resultados de Date.getDay() y lo almacena
            if ([1, 2, 3, 4, 5, 6, 7].includes(day)) effectiveWeekDays.push(parseInt(day) - 1);
        });

        //Función para reemplazar placeholders por cadenas
        async function parseWildcards(string) {

            //Almacena los placeholders detectados
            const placeHolders = string.match(/{{\s?([^{}\s]*)\s?}}/g);

            //Si se encontraron placeholders
            if (placeHolders !== null) {

                //Crea un objeto para almacenar los valores interpretados
                let wildcards = {};

                //Por cada uno de los placeholders
                for (let placeHolder of placeHolders) {

                    //Elimina los delimitadores del placeholder
                    placeHolder = placeHolder.replace('{{', '').replace('}}', '');
                    
                    //En función del tipo de placeholder
                    switch (placeHolder) {

                        //Si es para el nombre del servidor
                        case 'serverName':

                            //Almacena el nombre la guild
                            wildcards[placeHolder] = client.homeGuild.name;
                            
                            //Para el switch
                            break;

                        //Si es para el conteo de miembros
                        case 'memberCount':

                            //Calcula la cantidad de miembros de la guild
                            const guildMembers = await client.homeGuild.members.fetch();

                            //Almacena la cantidad de miembros de la guild
                            wildcards[placeHolder] = guildMembers.size;
                            
                            //Para el switch
                            break;

                        //Omite si se proporcionó un placeholder inválido
                        default: break;
                    };
                };

                //Cambia los placeholders por sus valores reales
                return await client.functions.utilities.parseLocale.run(string, wildcards);
            };

            //Devuelve la cadena sin modificar
            return string;
        };

        //Sustituye los placeholders del contenido por sus valores reales
        timer.content = await parseWildcards(timer.content);

        //Omite si el contenido del mensaje sobrepasa el valor máximo permitido
        if ((timer.embed && timer.embed.enabled && timer.content.length > 4096) || timer.content > 2000) continue;

        //Almacena el objecto con el contenido del mensaje en el formato deseado
        timedMessage = timer.embed && timer.embed.enabled ? { embeds: [ new client.MessageEmbed().setDescription(timer.content) ]} : { content: timer.content };

        //Si se ha configurado como embed
        if (timer.embed && timer.embed.enabled) {
            
            //Almacena las propiedades del embed
            const embedProperties = timer.embed;

            //Almacena el embed
            const timedEmbed = timedMessage.embeds[0];

            //Si se ha especificado un color, se lo añade al embed
            if (embedProperties.color) timedEmbed.setColor(embedProperties.color);

            //Si se ha especificado un título, se lo añade al embed
            if (embedProperties.title) timedEmbed.setTitle(embedProperties.title);

            //Si se ha especificado un pie, se lo añade al embed
            if (embedProperties.footer) timedEmbed.setFooter({ text: embedProperties.footer });

            //Si se han proporcionado cambios
            if (embedProperties.fields && Array.isArray(embedProperties.fields) && embedProperties.fields.length > 0) {

                //Por cada uno de los campos
                for (let index = 0; index < embedProperties.fields.length; index++) {

                    //Aborta si se ha superado el límite de API
                    if (index > 25) break;

                    //Almacena las propiedades del campo iterado
                    const field = embedProperties.fields[index];

                    //Añade el campo al embed
                    if (field.name && field.value) timedEmbed.addFields({ name: await parseWildcards(field.name), value: await parseWildcards(field.value), inline: field.inline });
                };
            };
        };

        //Si se ha configurado un botón
        if (timer.linkButton && timer.linkButton.label && timer.linkButton.url) {

            //Genera un nuevo botón
            let button = new client.MessageActionRow().addComponents( new client.MessageButton()
                .setLabel(timer.linkButton.label)
                .setStyle('LINK')
                .setURL(timer.linkButton.url),
            );

            //Si se ña especificado un emoji, lo añade al botón
            if (timer.linkButton.emoji) button.components[0].setEmoji(timer.linkButton.emoji);

            //Carga el botón en los componentes del embed
            timedMessage.components = [button];
        };

        //Genera un objeto para guardar la config. del timer en la BD
        const timerData = {
            "channelId": timer.channelId,
            "interval": timer.interval,
            "weekDays": timer.weekDays,
            "minimumMessagesSinceLast": timer.minimumMessagesSinceLast,
            "message": timedMessage,
        };

        //Genera un hash MD5 a partir de la config. del timer
        const hash = client.md5(JSON.stringify(timerData));

        //Si el timer no estaba almacenado en la BD
        if (!client.db.timers.messages[hash]) {

            //Lo añade a la BD
            client.db.timers.messages[hash] = timerData;
        };

        //Sobreescribe la base de datos
        client.fs.writeFile('./storage/databases/timers.json', JSON.stringify(client.db.timers, null, 4), async err => {

            //Si hubo un error, lo devuelve
            if (err) throw err;
        });
    };

    //Función para enviar mensajes temporizados
    async function sendMessage(hash, timerConfig, channel) {

        //Almacena el número de día de la semana
        const actualWeekDay = new Date().getDay();

        //Si hoy no se tiene que enviar, aborta
        if (!timerConfig.weekDays.includes(actualWeekDay)) return;

        //Almacena el último timer enviado
        const lastSentMsg = client.db.timers.sents[hash];

        //Almacena si lo ha encontrado o no
        let msgFound = false;

        //Si se ha enviado el timer al menos una vez
        if (lastSentMsg) {

            //Si no se ha rebasado el intervalo de tiempo mínimo, aborta
            if ((Date.now() - lastSentMsg.timestamp) < (timerConfig.interval - 1000)) return;

            //Busca los N últimos mensajes del canal en busca de un timer que no haya alcanzado el mínimo de mensajes posteriores
            const lastMessages = await channel.messages.fetch({ limit: timerConfig.minimumMessagesSinceLast });

            //Almacena un array con los IDs de los mensajes
            const messagesIds = Array.from(lastMessages.keys());

            //Por cada mensaje obtenido
            for (let index = 0; index < lastMessages.size; index++) {

                //Almacena el mensaje
                const message = lastMessages.get(messagesIds[index]);

                //Si se encontró el mensaje, para el bucle y cambia el estado de la variable msgFound
                if (message.id === lastSentMsg.id) return msgFound = true;
            };
        };

        //Si se encontró el mensaje, aborta el envío
        if (msgFound) return;

        //Envía el mensaje al canal especificado
        const sentMsg = await channel.send(timerConfig.message);

        //Actualiza la BD para guardar el ID del último timer
        client.db.timers.sents[hash] = {
            id: sentMsg.id,
            timestamp: Date.now()
        };

        //Sobreescribe la base de datos
        client.fs.writeFile('./storage/databases/timers.json', JSON.stringify(client.db.timers, null, 4), async err => {

            //Si hubo un error, lo devuelve
            if (err) throw err;
        });
    };

    //Por cada uno de los hashes (timers) de la BD
    for (const hash in client.db.timers.messages) {

        //Almacena la config. del timer
        const timerConfig = client.db.timers.messages[hash]; 

        //Busca el canal especificado en la config.
        const channel = await client.functions.utilities.fetch.run(client, 'channel', timerConfig.channelId);

        //Omite la iteración si no encuentra el mensaje
        if (!channel) continue;

        //Envía el mensaje al menos una vez
        sendMessage(hash, timerConfig, channel);

        //Programa un intervalo para enviar el timer
        setInterval(async () => { sendMessage(hash, timerConfig, channel) }, timerConfig.interval);
    };

    //Por cada hash de los timers enviado
    for (const hash in client.db.timers.sents) {

        //Si el timer asociado ya no existe
        if (!client.db.timers.messages[hash]) {

            //Lo borra de la BD
            delete client.db.timers.sents[hash];

            //Sobreescribe la base de datos
            client.fs.writeFile('./storage/databases/timers.json', JSON.stringify(client.db.timers, null, 4), async err => {

                //Si hubo un error, lo devuelve
                if (err) throw err;
            });
        };
    };

    //Envía una notificación a la consola
    console.log(` - [OK] ${locale.configLoaded}.`);
};

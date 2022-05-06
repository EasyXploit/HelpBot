exports.run = async (client) => {

    //Traducciones de los timers
    const locale = client.locale.utils.timers;

    //Aborta si los timersa están deshabilitados
    if (!client.config.main.timers) return;

    //Aborta si los timers no son un array
    if (!Array.isArray(client.config.timers)) return;

    //Almacena un objeto estrcuturado con los timers
    let timers = {};

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
            if (['1', '2', '3', '4', '5', '6', '7'].includes(day)) effectiveWeekDays.push(parseInt(day) - 1);
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
                return await client.functions.localeParser(string, wildcards);
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
                    if (field.name && field.value) timedEmbed.addField(await parseWildcards(field.name), await parseWildcards(field.value), field.inline);
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

        //Crea y almacena el objeto estructurado de timers con el mismo canal 
        if (!timers[timer.channelId]) timers[timer.channelId] = {};
        const actualTimedChannel = timers[timer.channelId];

        //Crea y almacena el objeto estructurado de timers con el mismo intervalo 
        if (!actualTimedChannel[timer.interval]) actualTimedChannel[timer.interval] = {};
        const actualTimedInterval = actualTimedChannel[timer.interval];

        //Crea y almacena el objeto estructurado de timers con el mismo margen de mensajes anteriores 
        if (!actualTimedInterval[timer.minimumMessagesSinceLast]) actualTimedInterval[timer.minimumMessagesSinceLast] = [];
        const actualTimedSince = actualTimedInterval[timer.minimumMessagesSinceLast];

        //Almacena los días de la semana de ejecución configurados, si son válidos
        if (effectiveWeekDays.includes(new Date().getDay())) actualTimedSince.push(timedMessage);
    };

    //Función para enviar los lotes de mensajes a los canales
    async function sendTimedMessages(channel, minimumMessagesSinceLast, timedMessages) {

        //Almacena los últimos mensajes del canal
        const lastMessages = await channel.messages.fetch({ limit: minimumMessagesSinceLast });

        //Almacena un array con los IDs de los mensajes
        const messagesIds = Array.from(lastMessages.keys());

        //Por cada mensaje obtenido
        for (let index = 0; index < lastMessages.size; index++) {

            //Almacena el mensaje
            const message = lastMessages.get(messagesIds[index]);

            //Comprueba que no sea de un bot
            if (message.author.bot) return;

            //Si se ha llegado al final de la lista de mensajes
            if ((index + 1) === lastMessages.size) {

                //Por cada uno de los mensajes a enviar
                await timedMessages.forEach(async timedMessage => {

                    //Envía el mensaje al canal especificado
                    await channel.send(timedMessage);
                });
            };
        };
    };

    //Por cada uno de los timers
    for (const sameChannelId in timers) {

        //Busca y almacena el canal
        const channel = await client.functions.fetchChannel(client.homeGuild, sameChannelId);

        //Si no hay canal, omite la iteración
        if (!channel) continue;

        //Por cada uno de los timers con el mismo intervalo
        for (const sameInterval in timers[sameChannelId]) {

            //Por cada uno de los timers con el mismo margen de mensajes anteriores 
            for (const sinceSameTime in timers[sameChannelId][sameInterval]) {

                //Almacena el grupo de mensajes a enviar
                const timedGroup = timers[sameChannelId][sameInterval][sinceSameTime];

                //Envía el grupo de mensajes por primera vez (si corresponde)
                //sendTimedMessages(channel, sinceSameTime, timedGroup);

                //Crea un intervalo para enviar los grupos de mensajes (si corresponde)
                setInterval(async () => { sendTimedMessages(channel, sinceSameTime, timedGroup) }, sameInterval);
            };
        };
    };

    //Envía una notificación a la consola
    console.log(` - [OK] ${locale.configLoaded}.`);
};

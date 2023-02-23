//Función para comprobar el contenido de los mensajes enviados
exports.run = async (client, message) => {

    //Almacena las traducciones
    const locale = client.locale.functions.moderation.checkMessage;

    //Carga los filtros de automoderación
    const filters = client.config.automodFilters;

    //Almacena si el mensaje está permitido
    let isPermitted = true;

    //Almacena la URL del adjunto filtrado
    let filteredURL;

    //Por cada uno de los filtros de automoderación
    filtersLoop: for (const filter in filters) {

        //Almacena la configuración del filtro
        const filterCfg = filters[filter];

        //Lo omite si está desactivado
        if (!filterCfg.status) continue;

        //Si el filtro funciona en MD, es un mensaje directo y su uso está desactivado, omite
        if (message.channel.type === 'DM' && (!filterCfg['onDM'] || filterCfg.onDM === false)) continue;

        //Lo omite si el autor del mensaje es el propietario de la guild
        if (message.author.id === client.homeGuild.ownerId) continue;

        //Almacena los roles, miembros y canales a los que no afecta
        const bypassIds = filterCfg.bypassIds;

        //Lo omite si el canal tiene el filtro desactivado
        if (message.channel && bypassIds.includes(message.channel.id)) continue;

        //Lo omite si el miembro o alguno de sus roles tiene el filtro desactivado
        for (let index = 0; index < bypassIds.length; index++) if (message.member.id === bypassIds[index] || message.member.roles.cache.has(bypassIds[index])) continue filtersLoop;

        //Almacena si un filtro ha encajado
        let match;

        //En función del filtro iterado
        switch (filter) {

            //Filtro de inundación de canales con muchos mensajes
            case 'flood':

                //Almacena el historial de mensajes del miembro
                const history = client.memberMessages[message.member.id] ? client.memberMessages[message.member.id].history : [];

                //Omite si el historial no es lo suficientemente amplio
                if (history.length < filterCfg.triggerLimit) break;

                //Almacena un contador de mensajes hasta alcanzar el tope
                let matchesCount = 0;

                //Itera el historial de mensajes hasta el límite de alarma
                for (let index = 0; index <= filterCfg.triggerLimit; index++) {

                    //Almacena el mennsaje iterado, y el previo
                    const iteratedMessage = history[history.length - index - 1];
                    const previousMessage = history[history.length - index - 2];
                    
                    //Si no supera el umbral de aceptación, aumenta el recuento, pero si lo supera, omite el bucle
                    if (previousMessage && iteratedMessage.timestamp - previousMessage.timestamp < filterCfg.maxTimeBetween) matchesCount++;
                    else break;
                };

                //Si se supera o iguala el límite, propaga la coincidencia
                if (matchesCount >= filterCfg.triggerLimit) match = true;

                //Para el switch
                break;

            //Filtro de inundación de varios canales con el mismo mensaje
            case 'crossPost':

                //Almacena el historial de mensajes del miembro
                const messagesHistory = client.memberMessages[message.member.id].history;

                //Omite si el historial no es lo suficientemente amplio
                if (messagesHistory.length < filterCfg.triggerLimit) break;

                //Almacena un contador de mensajes hasta alcanzar el tope
                let matches = 0;

                //Itera el historial de mensajes hasta el límite de alarma
                for (let index = 0; index <= filterCfg.triggerLimit; index++) {

                    //Almacena el mensaje iterado, y el previo
                    const iteratedMessage = messagesHistory[messagesHistory.length - index - 1];
                    const previousMessage = messagesHistory[messagesHistory.length - index - 2];

                    //Si no supera el umbral de aceptación y hay mensaje previo
                    if (previousMessage && iteratedMessage.hash === previousMessage.hash) {

                        //Incrementa el contador de coincidencias 
                        matches++;

                        //Almacena el contenido del mensaje filtrado
                        filteredURL = iteratedMessage.content;

                    } else if (index === 0) break; //Sino y es el primer mensaje, omite el bucle
                };

                //Si se supera o iguala el límite, propaga la coincidencia
                if (matches >= filterCfg.triggerLimit) match = true;

                //Para el switch
                break;

            //Filtro de palabras malsonantes
            case 'swearWords':

                //Almacena las palabras prohibidas
                const words = client.config.bannedWords;

                //Comprueba si el mensaje contenía palabras prohibidas
                if (words.some(word => message.content.toLowerCase().includes(word))) match = true;
                
                //Para el switch
                break;

            //Filtro de invitaciones
            case 'invites':

                //Filtra el texto en busca de códigos de invitación
                let detectedInvites = message.content.match(new RegExp(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s\/]+?(?=\b)/gm));

                //Si se encontraron invitaciones, se comprueba que no sean de la guild
                if (detectedInvites) {

                    //Almacena el recuento de invitaciones legítimas
                    let legitInvites = 0;

                    //Almacena las invitaciones del servidor
                    await client.homeGuild.invites.fetch().then(guildInvites => {

                        //Crea un array con los códigos de invitación
                        let inviteCodes = Array.from(guildInvites.keys());

                        //Por cada invitación detectada en el mensaje
                        detectedInvites.forEach(filteredInvite => {

                            //Por cada código de invitación de la guild
                            inviteCodes.forEach(inviteCode => {

                                //Comprueba si se trata de una invitación de esta guild
                                if (filteredInvite.includes(inviteCode)) legitInvites++;
                            });
                        });
                    });

                    //Comprueba si encontró una invitación que no era de la guild
                    if (legitInvites < detectedInvites.length) match = true;
                };
                
                //Para el switch
                break;

            //Filtro de mayúsculas excesivas
            case 'uppercase':

                //Comprueba si el mensaje alcanza la longitud mínima para ejecutar el filtro
                if (message.content.length < filters.uppercase.minimumLength) break;

                //Comprueba si superan el umbral máximo permitido
                if (message.content.replace(new RegExp(/[^A-Z]/g), '').length > (message.content.length / 100) * filters.uppercase.percentage) match = true;
                
                //Para el switch
                break;

            //Filtro de  enlaces
            case 'links':

                //Comprueba si el mensaje contiene un enlace
                const urlRegex = RegExp('https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}');

                //Devuelve "true" si lo contenía
                match = urlRegex.test(message.content);
                
                //Para el switch
                break;

            //Filtro de emojis masivos
            case 'massEmojis':

                //Función para contar emojis
                function countEmojis(str) {

                    //Devuelve la cantidad de emojis encontrada
                    return Array.from(str.split(/[\ufe00-\ufe0f]/).join('')).length;
                };

                //Almacena una copia del mensaje sin emojis UTF
                const stringWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

                //Almacena los emojis de servidor encontrados
                let serverEmojis = message.content.match(new RegExp(/<:.+?:\d+>/g));

                //Si hubieron emojis de servidor, almacena su cantidad
                if (serverEmojis) serverEmojis = serverEmojis.length;

                //Almacena la cantidad total de emojis en el mensaje
                const emojiCount = (countEmojis(message.content) - countEmojis(stringWithoutUTFEmojis)) + serverEmojis;

                //Comprueba si superan el umbral máximo permitido
                if (emojiCount > filters.massEmojis.quantity) match = true;
                
                //Para el switch
                break;

            //Filtro de menciones masivas
            case 'massMentions':

                //Cuenta las menciones del mensaje
                const mentionCount = (message.content.match(new RegExp(/<@!?(\d+)>/g)) || []).length;

                //Comprueba si superan el umbral máximo permitido
                if (mentionCount > filters.massMentions.quantity) match = true;
                
                //Para el switch
                break;

            //Filtro de spoilers masivos
            case 'massSpoilers':

                //Cuenta los spoilers del mensaje
                const spoilerCount = (message.content.match(new RegExp(/\|\|.*?\|\|/g)) || []).length;

                //Comprueba si superan el umbral máximo permitido
                if (spoilerCount > filters.massSpoilers.quantity) match =  true;
                
                //Para el switch
                break;

            //Filtro de texto repetitivo
            case 'repeatedText':

                //Almacena una copia del mensaje sin emojis UTF
                const messageWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

                //Almacena una copia del mensaje sin ningún tipo de emoji
                const messageWithoutEmojis = messageWithoutUTFEmojis.replace(new RegExp(/<:.+?:\d+>/g), "");

                //Comprueba si el mensaje contenía texto repetitivo
                match = new RegExp(`^(.+)(?: +\\1){${filters.repeatedText.maxRepetitions}}`).test(messageWithoutEmojis);
                
                //Para el switch
                break;
        };

        //Si se encontró una infracción
        if (match) {

            //Almacena el estado de no permisión del mensaje
            isPermitted = false;

            //Almacena la razón de la infracción
            const reason = message.channel.type === 'DM' ? `${filterCfg.reason} (${locale.filteredDm})` : filterCfg.reason; 
        
            //Ejecuta el manejador de infracciones
            await client.functions.moderation.manageWarn.run(client, message.member, reason, filterCfg.action, client.user, message, null, message.channel, message.content.length === 0 ? filteredURL : null);

            //Para el resto del bucle
            break;
        };
    };

    //Devuelve el resultado del filtrado
    return isPermitted;
};

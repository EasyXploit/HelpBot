//Función apara comprobar el contenido de los mensajes enviados
exports.run = async (client, message) => {

    //Carga los filtros de automoderación
    const filters = client.config.automodFilters;

    //Almacena si el mensaje está permitido
    let isPermitted = true;

    //Por cada uno de los filtros de automoderación
    for (const filter in filters) {

        //Almacena la configuración del filtro
        const filterCfg = filters[filter];

        //Lo omite si está desactivado
        if (!filterCfg.status) continue;

        //Si el filtro funciona en MD, es un mensaje directo y su uso está desactivado, omite
        if (message.channel.type === 'DM' && (!filterCfg.hasOwnProperty('onDM') || filterCfg.onDM === false)) continue;

        //Lo omite si el autor del mensaje es el propietario de la guild
        if (message.author.id === client.homeGuild.ownerId) continue;

        //Almacena los canales a los que no afecta
        const bypassChannels = filterCfg.bypassChannels;

        //Lo omite si el canal tiene el filtro desactivado
        if (message.channel && bypassChannels.includes(message.channel.id)) continue;

        //Busca y almacena al miembro en la guild
        const guildMember = await client.functions.utilities.fetch.run(client, 'member', message.author.id)

        //Almacena los roles a los que no afecta
        const bypassRoles = filterCfg.bypassRoles;

        //Lo omite si algún rol del miembro tiene el filtro desactivado
        for (let index = 0; index < bypassRoles.length; index++) if (guildMember.roles.cache.has(bypassRoles[index])) continue;

        //Almacena si un filtro ha encajado
        let match;

        //En función del filtro iterado
        switch (filter) {

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
                if (spoilerCount > filters.massSpoilers.quantity) return true;
                
                //Para el switch
                break;

            //Filtro de texto repetitivo
            case 'repeatedText':

                //Comprueba si el mensaje contenía texto repetitivo
                match = new RegExp(/^(.+)(?: +\1){3}/).test(message.content);
                
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
            await client.functions.moderation.manageWarn.run(client, guildMember, reason, filterCfg.action, client.user, message, null, message.channel);

            //Para el resto del bucle
            break;
        };
    };

    //Devuelve el resultado del filtrado
    return isPermitted;
};
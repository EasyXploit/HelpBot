exports.run = (client) => {
    
    //Crea un objeto para almacenar todas las funciones
    client.functions = {};

    //Almacena las traducciones
    const locale = client.locale.utils.functions;

    //Función para buscar miembros
    client.functions.fetchMember = async member => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de miembro
            const matches = member.toString().match(/^<@!?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await client.homeGuild.members.fetch(matches[1]);
            else if (!isNaN(member)) result = await client.homeGuild.members.fetch(member);

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para buscar usuarios
    client.functions.fetchUser = async user => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de usuario
            const matches = user.toString().match(/^<@!?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await client.users.fetch(matches[1]);
            else if (!isNaN(user)) result = await client.users.fetch(user);

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para buscar roles
    client.functions.fetchRole = async role => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de rol
            const matches = role.toString().match(/^<@&?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await client.homeGuild.roles.fetch(matches[1]);
            else if (!isNaN(role)) result = await client.homeGuild.roles.fetch(role);

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para buscar canales
    client.functions.fetchChannel = async channel => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de canal
            const matches = channel.toString().match(/^<#?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await client.homeGuild.channels.fetch(matches[1]);
            else if (!isNaN(channel)) result = await client.homeGuild.channels.fetch(channel);

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para buscar mensajes
    client.functions.fetchMessage = async (message, channel) => {

        try {

            //Almacena el resultado
            let result;

            //Si se proporcionó un canal
            if (channel) {

                //Busca dicho canal en la guild
                const fetchedChannel = await client.functions.fetchChannel(channel);

                //Si hubo canal, busca dicho mensaje en el canal
                if (fetchedChannel && !isNaN(message)) result = await fetchedChannel.messages.fetch(message);

            } else {

                //Almacena los canales de la guild
                const guildChannels = await client.homeGuild.channels.fetch();

                //Itera entre todos los canales de la guild
                for (const channelId of guildChannels) {

                    //Almacena el canal iterado
                    const iteratedChannel = await guildChannels.get(channelId[0]);

                    try {

                        //Busca el mensaje en el canal de la iteración actual
                        const fetchedMessage = await iteratedChannel.messages.fetch(message);

                        //Si encontró el mensaje, lo devuelve
                        if (fetchedMessage) return result = fetchedMessage;

                    } catch (error) { 

                        //Si no se encontró el mensaje en este canal, continua con el siguiente
                        if (error.toString().includes('Unknown Message')) continue;
                    };
                };
            };

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para reemplazar comodines en las traducciones
    client.functions.localeParser = (expression, valuesObject) => {

        //Almacena el texto, con los comodines de la expresión reemplazados
        const text = expression.replace(/{{\s?([^{}\s]*)\s?}}/g, (substring, value, index) => {

            //Almacena el valor reemplazado
            value = valuesObject[value];

            //Devuelve el valor
            return value;
        });

        //Devuelve el texto reemplazado
        return text;
    };
      

    //Función para comprobar si un miembro tiene permiso para ejecutar un comando
    client.functions.checkCommandPermission = async (message, commandConfig) => {

        //Almacena el estado de autorización
        let authorized = false;

        //Si la lista blanca contiene entradas
        if (commandConfig.whitelistedRoles.length > 0) {

            //Para cada ID de rol de la lista blanca
            for (let index = 0; index < commandConfig.whitelistedRoles.length; index++) {

                //Si se permite a todo el mundo, el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (commandConfig.whitelistedRoles[index] === 'everyone' || message.author.id === message.guild.ownerId || message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || message.member.roles.cache.find(role => role.id === commandConfig.whitelistedRoles[index])) {

                    //Autoriza la ejecución
                    authorized = true;

                    //Aborta el bucle
                    break;
                };
            };

        } else if (commandConfig.blacklistedRoles.length > 0) { //Si la lista negra contiene entradas

            //Para cada ID de rol de la lista negra
            for (let index = 0; index < commandConfig.blacklistedRoles.length; index++) {

                //Si no se permite a todo el mundo y el que invocó el comando no es el dueño, entonces deniega la ejecución
                if (commandConfig.blacklistedRoles[index] === 'everyone' && message.author.id !== message.guild.ownerId) break;

                //Si uno de los roles del miembno coincide con la lista negra, entonces deniega la ejecución
                if (message.member.roles.cache.find(role => role.id === commandConfig.blacklistedRoles[index])) break;

                //Autoriza la ejecución si se ha acabado el bucle
                if (index === commandConfig.blacklistedRoles.length - 1) authorized = true;
            };

        } else if (message.author.id === message.guild.ownerId || message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole)) {

            //Autoriza la ejecución
            authorized = true;
        };

        //Devuelve la autorización
        return authorized;
    };

    //Función para comprobar si existe el rol silenciado, y de no existir, crearlo
    client.functions.checkMutedRole = async (guild) => {

        //Busca el rol silenciado
        let mutedRole = await guild.roles.fetch(client.config.dynamic.mutedRoleId);

        //Si no existe el rol silenciado (o su nombre es diferente al configurado), lo crea
        if (!mutedRole || mutedRole.name !== client.config.moderation.mutedRoleName) {

            //Borra el anterior rol si es necesario
            if (mutedRole && mutedRole.name !== client.config.moderation.mutedRoleName) await mutedRole.delete(locale.checkMutedRole.replacing);

            //Crea un nuevo rol silenciado
            mutedRole = await guild.roles.create({
                name: client.config.moderation.mutedRoleName,
                color: client.config.colors.mutedRole,
                permissions: [],
                reason: locale.checkMutedRole.reason
            });
            
            //Asigna el rol a la posición más alta posible
            const botMember = await guild.members.cache.get(client.user.id);
            await mutedRole.setPosition(botMember.roles.highest.position - 1);

            //Graba el nuevo rol en la configuración
            client.config.dynamic.mutedRoleId = mutedRole.id;

            //Graba el ID en el fichero de configuración
            await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });

            //Por cada ID de miembro en la base de datos de muteos
            for (const memberId in client.db.mutes) {

                //Busca y almacena el miembro
                const member = await client.functions.fetchMember(memberId);

                //Añade el rol silenciado al miembro
                await member.roles.add(mutedRole);
            };
        };
        
        //Devuelve el rol silenciado
        return mutedRole;
    };

    //Función para propagar el rol silenciado
    client.functions.spreadMutedRole = async (guild) => {

        //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(role => role.id === client.config.dynamic.mutedRoleId);

        //Para cada canal, añade el permiso para el rol
        await guild.channels.cache.forEach(async (channel) => {

            //Ignora este canal si debe estar excluido del silenciamiento
            if (client.config.moderation.mutedRoleExcludedChannels.includes(channel.id)) return;

            //Ignora este canal si se trata de canal sin permisos propios (e.g. hilos)
            if (!channel.permissionOverwrites) return;

            //Si el canal tiene un permiso para el rol silenciado, lo almacena
            const mutedRolePermissions = channel.permissionOverwrites.resolve(mutedRole.id);

            //Si el canal no tiene el permiso y el bitfield no coincide con las negaciones pertinentes, añade el permiso
            if (!mutedRolePermissions || ((mutedRolePermissions.deny & BigInt(0x800)) !== BigInt(0x800) || (mutedRolePermissions.deny & BigInt(0x40)) !== BigInt(0x40)) || ((mutedRolePermissions.deny & BigInt(0x200000)) !== BigInt(0x200000))) {
                
                //Cambia los permisos del rol
                await channel.permissionOverwrites.edit(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    CREATE_PUBLIC_THREADS: false,
                    CREATE_PRIVATE_THREADS: false,
                    SEND_MESSAGES_IN_THREADS: false,
                    START_EMBEDDED_ACTIVITIES: false,
                    CONNECT: false
                });
            };
        });
    };

    //Función para añadir XP (mode = message || voice)
    client.functions.addXP = async (member, mode, channel) => {

        //Para comprobar si el rol puede ganar XP o no.
        let nonXP;

        //Para cada rol que tiene prohibido ganar XP
        for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {

            //Si el miembro tiene dicho rol
            if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {

                //Ajusta la variable de estado
                nonXP = true;

                //Para el bucle
                break;
            };
        };

        //Devuelve si no se puede ganar XP
        if (nonXP) return;

        //Si el miembro no tiene tabla de XP
        if (!client.db.stats[member.id]) {

            //Crea la tabla del miembro
            client.db.stats[member.id] = {
                totalXP: 0,
                actualXP: 0,
                level: 0,
                lastMessage: 0,
                aproxVoiceTime: 0
            };
        };

        //Almacena las stats del miembro
        const memberStats = client.db.stats[member.id];

        //Genera XP si es un canal de voz o si se ha sobrepasado el umbral de cola de mensajes
        if (mode === 'voice' || (mode === 'message' && Date.now() - memberStats.lastMessage > client.config.xp.minimumTimeBetweenMessages)) {

            //Genera XP aleatorio según los rangos
            const newXp = await client.functions.randomIntBetween(client.config.xp.minimumXpReward, client.config.xp.maximumXpReward);

            //Añade el XP a la cantidad actual del miembro
            memberStats.actualXP += newXp;
            memberStats.totalXP += newXp;

            //Si es un mensaje, actualiza la variable para evitar spam
            if (mode === 'message') memberStats.lastMessage = Date.now();

            //Si es un intervalo de voz, concatena la duración de un intervalo de voz en las stats del miembro
            if (mode === 'voice') memberStats.aproxVoiceTime += client.config.xp.XPGainInterval;

            //Fórmula para calcular el XP necesario para subir al siguiente nivel
            const xpToNextLevel = await client.functions.xpToLevel(memberStats.level + 1)

            //Comprueba si el miembro ha de subir de nivel
            if (memberStats.totalXP >= xpToNextLevel) {

                //Ajusta el nivel del miembro
                memberStats.level++;

                //Ajusta el XP actual de miembro
                memberStats.actualXP = xpToNextLevel - memberStats.totalXP;

                //Asigna las recompensas correspondientes al nivel (si corresponde), y almacena los roles recompensados
                const rewardedRoles = await client.functions.assignRewards(member, memberStats.level);

                //Genera un embed de subida de nivel
                let levelUpEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.primary)
                    .setAuthor({ name: locale.addXP.levelUpEmbed.author, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .setDescription(`${client.functions.localeParser(locale.addXP.levelUpEmbed.description, { member: member, memberLevel: memberStats.level })}.`);

                //Si se recompensó al miembro con roles
                if (rewardedRoles) {

                    //Almacena los nombres de los roles
                    const roleNames = [];

                    //Por cada uno de los roles recompensados
                    for (const roleId of rewardedRoles) {

                        //Busca el rol en la guild
                        const fetchedRole = await client.functions.fetchRole(roleId);

                        //Sube al array de nombre, el nombre del rol iterado
                        roleNames.push(fetchedRole.name);
                    };

                    //Añade un campo al embed de levelup con los roles recompensados
                    levelUpEmbed.addField(locale.addXP.levelUpEmbed.rewards, `\`${roleNames.join('`, `')}\``);
                };

                //Manda el mensaje de subida de nivel, si se ha configurado
                if (mode === 'message' && client.config.xp.notifylevelUpOnChat) channel.send({ embeds: [levelUpEmbed] });
                if (mode === 'voice' && client.config.xp.notifylevelUpOnVoice) member.send({ embeds: [levelUpEmbed] });
            };

            //Guarda las nuevas estadísticas del miembro en la base de datos
            client.fs.writeFile('./databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
                if (err) throw err;
            });
        };
    };

    //Función para asignar recompensas
    client.functions.assignRewards = async (member, memberLevel, updateSubsequents) => {

        //Función para comparar un array
        function compare(a, b) {
            if (a.requiredLevel > b.requiredLevel) return 1;
            if (a.requiredLevel < b.requiredLevel) return -1;
            return 0;
        };

        //Compara y ordena el array de recompensas
        const sortedRewards = client.config.levelingRewards.sort(compare);

        //Almacena los roles de recompensa a asignar
        let toReward = [];

        //Por cada una de las recompensas disponibles en la config.
        for (let index = 0; index < sortedRewards.length; index++) {

            //Almacena la recompensa iterada
            const reward = sortedRewards[index];

            //Si la recompensa sobrepasa el nivel del miembro, para el bucle
            if (!updateSubsequents && reward.requiredLevel > memberLevel) break;

            //Por cada uno de los roles de dicha recompensa
            reward.roles.forEach(async role => {

                //Si no se deben preservar viejas recompensas
                if ((client.config.xp.removePreviousRewards && !(sortedRewards[index + 1] && reward.requiredLevel < memberLevel && sortedRewards[index + 1].requiredLevel > memberLevel) && index !== (sortedRewards.length - 1)) || reward.requiredLevel > memberLevel) {

                    //Le elimina el rol al miembro, si lo tiene
                    if (member.roles.cache.has(role)) await member.roles.remove(role);
                };
            });

            //Si el miembro puede stackear todas las recompensas, o tiene el nivel de esta, se almacena
            if (!client.config.xp.removePreviousRewards || reward.requiredLevel === memberLevel || (reward.requiredLevel < memberLevel && index === (sortedRewards.length - 1))) toReward = toReward.concat(reward.roles);

            //Si el miembro tiene cómo mínimo el nivel de la recompensa anterior, esta se almacena
            if (client.config.xp.removePreviousRewards && sortedRewards[index + 1] && reward.requiredLevel < memberLevel && memberLevel < sortedRewards[index + 1].requiredLevel) toReward = toReward.concat(reward.roles);
        };

        //Si hubieron roles a asignar
        if (toReward.length > 0) {

            //Almacena los roles recompensados
            let rewarded = [];

            //Asigna cada uno de ellos
            toReward.forEach(async role => {

                //Si el miembro aún no tiene el rol
                if (!member.roles.cache.has(role)) {

                    //Le añade el rol
                    member.roles.add(role);

                    //Almacena el rol recompensado
                    rewarded.push(role);
                };
            });

            //Devuelve los roles recompensados
            if (rewarded.length > 0) return toReward;
        };
    };

    //Función para calcular el XP necesario para obtener un nivel determinado
    client.functions.xpToLevel = async level => {

        //Devuelve el resultado
        return (5 * client.config.xp.dificultyModifier) * Math.pow((level - 1), 3) + 50 * (level - 1) + 100;
    };

    //Función para generar números enteros aleatorios dentro de un rango
    client.functions.randomIntBetween = async (min, max) => {

        //Redondea a la baja el mínimo
        min = Math.ceil(min);

        //Redondea al alza el máximo
        max = Math.floor(max);

        //Devuelve un entero aleatorio entre min y max
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    //Función para convertir de MS a HH:MM:SS
    client.functions.msToDHHMMSS = (ms) => {

        //Convierte a segundos
        let seconds = parseInt(ms / 1000);

        //Extrae los dias
        const days = parseInt(seconds / 86400);
        seconds = seconds % 86400;

        //Extrae las horas
        const hours = parseInt(seconds / 3600);
        seconds = seconds % 3600;

        //Extrae los minutos
        const minutes =  parseInt(seconds / 60);

        //Se queda solo con los segundos NO extraidos a los minutos
        seconds = parseInt(seconds % 60);

        //Muestra ceros de relleno si fuera necesario
        const hoursStr = ('00' + hours).slice(-2);
        const minutesStr = ('00' + minutes).slice(-2);
        const secondsStr = ('00' + seconds).slice(-2);

        //Devuelve el resultado
        return `${days > 0 ? `${days}d ` : ''}${hoursStr}:${minutesStr}:${secondsStr}`;
    };

    //Función para convertir de HH:MM:SS a MS
    client.functions.HHMMSSToMs = (HHMMSS) => {

        //Divide en un array mediante la separación de :
        const splittedTime = HHMMSS.split(':');

        //Añade los campos restantes
        while (splittedTime.length !== 3) splittedTime.splice(0, 0, 00);

        //Transforma la cadena a segundos.
        const seconds = ( + splittedTime[0] ) * 60 * 60 + ( + splittedTime[1] ) * 60 + ( + splittedTime[2] ); 

        //Devuelve el resultado en MS
        return seconds * 1000;
    };

    //Función para convertir magnitudes a milisegundos
    client.functions.magnitudesToMs = async (duration) => {

        //Almacena el resultado
        let result = 0;

        //Función para separar partes de magnitudes y calcular milisegundos 
        async function parseMillis(magnitude) {

            //Obtiene la magnitud de tiempo
            const time = magnitude.slice(0, -1);

            //Obtiene la unidad de medida
            const measure = magnitude.slice(-1).toLowerCase();

            //Comprueba si se ha proporcionado un número
            if (isNaN(time)) return false;

            //Comprueba si se ha proporcionado una unidad de medida válida
            if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return false;

            //Almacena los milisegundos resultantes
            let milliseconds;

            //Transforma a milisegundos según la medida
            switch (measure) {
                case 's': milliseconds = time * 1000;       break;
                case 'm': milliseconds = time * 60000;      break;
                case 'h': milliseconds = time * 3600000;    break;
                case 'd': milliseconds = time * 86400000;   break;
            };

            //Devuelve el resultado
            return milliseconds;
        };

        //Comprueba si se ha proporcionado un array o no
        if (Array.isArray(duration)) {
            
            //Por cada parámetro del array
            for (const parameter of duration) {

                //Lo convierte a milisegundos
                const parsedMillis = await parseMillis(parameter);

                //Si se obtuvo un resultado, lo suma
                if (parsedMillis) result += parsedMillis;
            };

        } else {

            //Lo convierte a milisegundos
            const parsedMillis = await parseMillis(duration);

            //Si se obtuvo un resultado, lo suma
            if (parsedMillis) result += parsedMillis;
        };

        //Si se calculó un resultado, lo devuelve
        if (result > 0) return result;
    };

    //Función para eliminar claves indefinidas o nulas de un array de objetos
    client.functions.isArrOfObjNil = async (array, lodash) => {

        //Requiere "lodash" para comparar objetos
        lodash ? lodash : require('lodash');

        //Almacena un array para los objetos modificadoss
        let cleanArray = [];

        //Por cada uno de los objetos del array
        for (let object of array) {

            //Por cada una de las propiedades del objeto iterado
            for (let property in object) {

                //Si la propiedad un array y tienes valores
                if (Array.isArray(object[property]) && object[property].length > 0) {
                    
                    //Ejecuta esta misma función de manera recursiva sobre dicho array
                    object[property] = await client.functions.isArrOfObjNil(object[property], lodash);
                }
            };

            //Elimina las claves nulas o indefinidas de la propiedad y la sube al array de objetos modificados
            cleanArray.push(lodash.omitBy(object, lodash.isNil));
        };

        //Devuelve el nuevo array
        return cleanArray;
    };

    //Función para comprobar los nombres de usuario de los miembros
    client.functions.checkUsername = async member => {

        //Almacena las listas de palabras prohibidas
        const forbiddenNames = client.config.moderation.newMemberForbiddenNames;
        const bannedWords = client.config.bannedWords;

        //Si procede, comprueba si han de comprobarse los nombres de usuario
        const containsForbiddenNames = forbiddenNames.some(word => member.displayName.toLowerCase().includes(word));
        const containsBannedWords = client.config.moderation.includeBannedWords ? bannedWords.some(word => member.displayName.toLowerCase().includes(word)) : false;

        //Si contiene alguna palabra prohibida
        if (containsForbiddenNames || containsBannedWords) {

            //Si no hay caché de registros
            if (!client.loggingCache) client.loggingCache = {};

            //Crea una nueva entrada en la caché de registros
            client.loggingCache[member.id] = {
                action: 'kick',
                executor: client.user.id,
                reason: locale.checkUsername.kickReason
            };

            //Alerta al miembro de que ha sido expulsado
            await member.user.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: locale.checkUsername.privateEmbed.author, iconURL: member.guild.iconURL({dynamic: true}) })
                .setDescription(`${client.functions.localeParser(locale.checkUsername.privateEmbed.description, { member: member, guildName: member.guild.name })}.`)
                .addField(locale.checkUsername.privateEmbed.moderator, `${client.user}`, true)
                .addField(locale.checkUsername.privateEmbed.reasonTitle, `${locale.checkUsername.privateEmbed.reasonDescription}.`, true)
            ]});

            //Se expulsa al miembro
            await member.kick(member.user, { reason: locale.checkUsername.kickReason });

            //Devuelve "false"
            return false;
        };

        //Devuelve "true"
        return true;
    };

    //Función para dar gestionar nuevos miembros
    client.functions.manageNewMember = async member => {

        try {

            //Si hay que explicar a los miembros con un nombre de usuario prohibido
            if (client.configkickOnBadUsername) {

                //Comprueba si el nombre de usuario del miembro es válido
                const usernameIsValid = await client.functions.checkUsername(member);

                //Aborta si el nombre no era válido
                if (!usernameIsValid) return;
            };

            //Genera un embed con el registro de bienvenida
            let welcomeEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
                .setAuthor({ name: locale.manageNewMember.author, iconURL: 'attachment://in.png' })
                .setDescription(client.functions.localeParser(locale.manageNewMember.description, { memberTag: member.user.tag }))
                .addField(`🆔 ${locale.manageNewMember.memberId}`, member.user.id, true)
                .addField(`📝 ${locale.manageNewMember.registerDate}`, `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)

            //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración), y añade el campo al embed de registro (si pertoca)
            if (client.db.mutes[member.id] && client.db.mutes[member.id].until) welcomeEmbed.addField(`🔇 ${locale.manageNewMember.actualSanction}`, `${locale.manageNewMember.limitedSanction}: <t:${Math.round(new Date(client.db.mutes[member.id].until) / 1000)}>`, false);
            else if (client.db.mutes[member.id] && !client.db.mutes[member.id].until) welcomeEmbed.addField(`🔇 ${locale.manageNewMember.actualSanction}`, locale.manageNewMember.unlimitedSantion, false);

            //Se notifica en el canal de registro
            await client.joinsAndLeavesChannel.send({ embeds: [ welcomeEmbed ], files: ['./resources/images/in.png'] });

            //Añade el rol de bienvenida para nuevos miembros (si no lo tiene ya)
            if (member.roles.cache.has(client.config.main.newMemberRole)) await member.roles.add(client.config.main.newMemberRole);

        } catch (error) {

            //Ignora si el miembro no permite que se le envíen MDs
            if (error.toString().includes('Cannot send messages to this user')) return;

        };
    };

    //Función para generar sIDs
    client.functions.sidGenerator = length => {
        
        //Requiere el generador de IDs con un alfabeto personalizado
        const { customAlphabet } = require('nanoid');

        //Asigna el alfabeto y la longitud del ID
        const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10);

        //Devuelve el sID generado
        return nanoid();
    };

    //Función para gestionar el envío de registros al canal de registro
    client.functions.loggingManager = async (type, content) => {

        //Comprobar si el canal está configurado y almacenado en memoria
        if (client.config.main.loggingChannel && client.loggingChannel) {

            try {

                //Carga los permisos del bot en el canal de logging
                const channelPermissions = client.loggingChannel.permissionsFor(client.user);
                const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000) || (channelPermissions & BigInt(0x8000)) !== BigInt(0x8000));

                //Comprueba si el bot tiene permisos para mandar el contenido
                if (!missingPermission) {

                    //Envía el contenido al canal, en función del tipo
                    switch (type) {
                        case 'embed': await client.loggingChannel.send({ embeds: [content] }); break;
                        case 'file': await client.loggingChannel.send({ files: [content] }); break;
                        case 'text': await client.loggingChannel.send({ text: [content] }); break;
                        default: break;
                    };

                } else {

                    //Advertir por consola de que no se tienen permisos
                    console.error(`${new Date().toLocaleString()} 》${client.functions.localeParser(locale.loggingManager.cannotSend, { botUser: client.user.username })}.`);
                };

            } catch (error) {

                //Si el canal no es accesible
                if (error.toString().includes('Unknown Channel')) {

                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.loggingChannel = '';
                    client.loggingChannel = null;

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》${locale.loggingManager.cannotAccess}.`);

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
                } else {

                    //Muestra un error por consola
                    console.error(`${new Date().toLocaleString()} 》${locale.loggingManager.error}:`, error.stack);
                };
            };
        };
    };

    //Función para gestionar el envío de registros al canal de depuración
    client.functions.debuggingManager = async (type, content) => {
        
        //Comprobar si el canal está configurado y almacenado en memoria
        if (client.config.main.debuggingChannel && client.debuggingChannel) {

            try {

                //Carga los permisos del bot en el canal de debugging
                const channelPermissions = client.debuggingChannel.permissionsFor(client.user);
                const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000) || (channelPermissions & BigInt(0x8000)) !== BigInt(0x8000));

                //Comprueba si el bot tiene permisos para mandar el contenido
                if (!missingPermission) {

                    //Envía el contenido al canal, en función del tipo
                    switch (type) {
                        case 'embed': await client.debuggingChannel.send({ embeds: [content] }); break;
                        case 'file': await client.debuggingChannel.send({ files: [content] }); break;
                        case 'text': await client.debuggingChannel.send({ text: [content] }); break;
                        default: break;
                    };

                } else {

                    //Advertir por consola de que no se tienen permisos
                    console.error(`${new Date().toLocaleString()} 》${client.functions.localeParser(locale.debuggingManager.cannotSend, { botUser: client.user.username })}.`);
                };

            } catch (error) {

                //Si el canal no es accesible
                if (error.toString().includes('Unknown Channel')) {

                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.debuggingChannel = '';
                    client.debuggingChannel = null;

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》${locale.debuggingManager.cannotAccess}.`);

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
                    
                } else {

                    //Muestra un error por consola
                    console.error(`${new Date().toLocaleString()} 》${locale.debuggingManager.error}:`, error.stack);
                };
            };
        };
    };

    //Función para gestionar los errores en las interacciones
    client.functions.interactionErrorHandler = async (error, interaction) => {

        //Se comprueba si el error es provocado por la invocación de una interacción no existente, o por que no se pueden enviar MDs
        if (error.toString().includes('Cannot find module') || error.toString().includes('Cannot send messages to this user')) return;

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》${locale.interactionErrorHandler.error}:`, error.stack);

        //Almacena el string del error, y lo recorta si es necesario
        const errorString = error.stack.length > 1014 ? `${error.stack.slice(0, 1014)} ...` : error.stack;

        //Almacena los argumentos de la interacción
        const args = JSON.stringify(interaction.options._hoistedOptions);

        //Almacena el string de los argumentos, y lo recorta si es necesario
        const argsString = args.length > 1014 ? `${args.slice(0, 1014)} ...` : args;

        //Se almacena el nombre del comando (si procede)
        const commandName = interaction.commandName ? interaction.commandName : locale.interactionErrorHandler.noCommandName;

        //Se comprueba si se han proporcionado argumentos
        const arguments = interaction.options._hoistedOptions[0] ? `\`\`\`${argsString}\`\`\`` : locale.interactionErrorHandler.noArguments;

        //Genera un embed de notificación
        const notificationEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setTitle(`${client.customEmojis.redTick} ${client.locale.interactionErrorHandler.errorEmbed.title} ...`)
            .setDescription(client.locale.interactionErrorHandler.errorEmbed.description);

        try {

            //Responde a la interacción con el embed
            await interaction.reply({ embeds: [notificationEmbed], ephemeral: true});

        } catch (error) {

            //Almacena el canal de texto de la interacción
            const interactionChannel = await client.functions.fetchChannel(interaction.channelId);

            //Envía el embed al canal de texto
            interactionChannel.send({ embeds: [notificationEmbed]});
        };

        //Se muestra el error en el canal de depuración¡
        await client.functions.debuggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle(`📋 ${locale.interactionErrorHandler.debuggingEmbed.title}`)
            .setDescription(locale.interactionErrorHandler.debuggingEmbed.description)
            .addField(locale.interactionErrorHandler.debuggingEmbed.type, interaction.type, true)
            .addField(locale.interactionErrorHandler.debuggingEmbed.command, commandName, true)
            .addField(locale.interactionErrorHandler.debuggingEmbed.channel, `<@${interaction.channelId}>`, true)
            .addField(locale.interactionErrorHandler.debuggingEmbed.author, interaction.member.user.tag, true)
            .addField(locale.interactionErrorHandler.debuggingEmbed.date, `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField(locale.interactionErrorHandler.debuggingEmbed.arguments, arguments)
            .addField(locale.interactionErrorHandler.debuggingEmbed.error, `\`\`\`${errorString}\`\`\``)
            .setFooter({ text: locale.interactionErrorHandler.debuggingEmbed.footer })
        );
    };

    //Función para gestionar los errores en los eventos
    client.functions.eventErrorHandler = async (error, eventName) => {

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》${locale.eventErrorHandler.error}:`, error.stack);
        
        //Almacena el string del error, y lo recorta si es necesario
        const errorString = error.stack.length > 1014 ? `${error.stack.slice(0, 1014)} ...` : error.stack;

        //Se muestra el error en el canal de depuración
        await client.functions.debuggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle(`📋 ${locale.eventErrorHandler.debuggingEmbed.title}`)
            .setDescription(locale.eventErrorHandler.debuggingEmbed.description)
            .addField(locale.eventErrorHandler.debuggingEmbed.event, eventName, true)
            .addField(locale.eventErrorHandler.debuggingEmbed.date, `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField(locale.eventErrorHandler.debuggingEmbed.error, `\`\`\`${errorString}\`\`\``)
            .setFooter({ text: locale.eventErrorHandler.debuggingEmbed.footer })
        );
    };

    //Función para generar un footer para los embeds musicales
    client.functions.getMusicFooter = async (targetGuild) => {

        //Almacena la cola de reproducción de la guild
        const reproductionQueue = client.reproductionQueues[targetGuild.id];

        //Stores the footer
        let footer = `${locale.getMusicFooter.mode}: ${reproductionQueue && reproductionQueue.mode ? '' : '▶️'}`;

        //If there is a reproduction queue and a mode has been set
		if (reproductionQueue && reproductionQueue.mode) {

            //Changes the footer to add the symbol of the mode
			switch (reproductionQueue.mode) {
				case 'shuffle':     footer += '🔀'; break;
				case 'loop':        footer += '🔂'; break;
				case 'loopqueue':   footer += '🔁'; break;
			};
		};

        //Returns the footer
		return footer;
    };

    //Log the result of the functions loading
    console.log(` - [OK] ${locale.functionLoaded}.`);
};

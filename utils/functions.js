exports.run = (client) => {
    
    //Crea un objeto para almacenar todas las funciones
    client.functions = {};

    //Función para buscar miembros
    client.functions.fetchMember = async (guild, member) => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de miembro
            const matches = member.toString().match(/^<@!?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await guild.members.fetch(matches[1]);
            else if (!isNaN(member)) result = await guild.members.fetch(member);

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para buscar usuarios
    client.functions.fetchUser = async  (user) => {

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
    client.functions.fetchRole = async (guild, role) => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de rol
            const matches = role.toString().match(/^<@&?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await guild.roles.fetch(matches[1]);
            else if (!isNaN(role)) result = await guild.roles.fetch(role);

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
    };

    //Función para buscar canales
    client.functions.fetchChannel = async (guild, channel) => {

        try {

            //Almacena el resultado
            let result;

            //Comprueba si el parámetro coincide con el formato de mención de canal
            const matches = channel.toString().match(/^<#?(\d+)>$/);

            //Lo busca por ID o por mención (en función de la variable "matches")
            if (matches) result = await guild.channels.fetch(matches[1]);
            else if (!isNaN(channel)) result = await guild.channels.fetch(channel);

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
                const fetchedChannel = await client.functions.fetchChannel(client.homeGuild, channel);

                //Si hubo canal, busca dicho mensaje en el canal
                if (fetchedChannel && !isNaN(message)) result = await fetchedChannel.messages.fetch(message);

            } else {

                //Itera entre todos los canales de la guild
                for (const channel in client.homeGuild.channels) {

                    //Busca el mensaje en el canal de la iteración actual
                    const fetchedMessage = await channel.messages.fetch(message);

                    //Si encontró el mensaje, lo devuelve
                    if (fetchedMessage) result = fetchedMessage;
                };
            };

            //Si hubo resultado (y era váido), lo devuelve
            if (result && typeof result !== 'undefined') return result;

        } catch (error) {

            //Devuelve "falso"
            return false;
        };
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
                if (commandConfig.whitelistedRoles[index] === 'everyone' || message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(role => role.id === commandConfig.whitelistedRoles[index])) {

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

        } else if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole) {

            //Autoriza la ejecución
            authorized = true;
        };

        //Devuelve la autorización
        return authorized;
    };

    //Función para comprobar si existe el rol silenciado, y de no existir, crearlo
    client.functions.checkMutedRole = async (guild) => {

        //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(role => role.id === client.config.dynamic.mutedRoleId);

        //Si no existe el rol silenciado (o su nombre es diferente al configurado), lo crea
        if (!mutedRole || mutedRole.name !== client.config.moderation.mutedRoleName) {

            //Borra el anterior rol si es necesario
            if (mutedRole.name !== client.config.moderation.mutedRoleName) await mutedRole.delete('Será reemplazado por uno nuevo.');

            //Crea un nuevo rol silenciado
            mutedRole = await guild.roles.create({
                data: {
                    name: client.config.moderation.mutedRoleName,
                    color: client.config.colors.mutedRole,
                    permissions: []
                },
                reason: 'Rol para gestionar miembros silenciados'
            });
            
            //Asigna el rol a la posición más alta posible
            const botMember = await guild.members.cache.get(client.user.id);
            await mutedRole.setPosition(botMember.roles.highest.position - 1);

            //Graba el nuevo rol en la configuración
            client.config.dynamic.mutedRoleId = mutedRole.id;

            //Graba el ID en el fichero de configuración
            await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
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

            //Si el canal tiene un permiso para el rol silenciado, lo almacena
            const mutedRolePermissions = channel.permissionOverwrites.resolve(mutedRole.id);

            //Si el canal no tiene el permiso y el bitfield no coincide con las negaciones pertinentes, añade el permiso
            if (!mutedRolePermissions || ((mutedRolePermissions.deny & BigInt(0x800)) !== BigInt(0x800) || (mutedRolePermissions.deny & BigInt(0x40)) !== BigInt(0x40)) || ((mutedRolePermissions.deny & BigInt(0x200000)) !== BigInt(0x200000))) {
                
                //Cambia los permisos del rol
                await channel.permissionOverwrites.edit(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
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
                lastMessage: 0
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

            //Fórmula para calcular el XP necesario para subir de nivel
            const xpToNextLevel = ((5 * client.config.xp.dificultyModifier) * client.config.xp.dificultyModifier) * Math.pow(memberStats.level, 3) + 50 * memberStats.level + 100;

            //Comprueba si el miembro ha de subir de nivel
            if (memberStats.totalXP >= xpToNextLevel) {

                //Ajusta el nivel del miembro
                memberStats.level++;

                //Ajusta el XP actual de miembro
                memberStats.actualXP = ((5 * client.config.xp.dificultyModifier) * Math.pow(memberStats.level, 3) + 50 * memberStats.level + 100) - memberStats.totalXP;

                //Asigna las recompensas correspondientes al nivel (si corresponde), y almacena los roles recompensados
                const rewardedRoles = await client.functions.assignRewards(member, memberStats.level);

                //Genera un embed de subida de nivel
                let levelUpEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.primary)
                    .setAuthor({ name: '¡Subiste de nivel!', iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .setDescription(`Enhorabuena ${member}, has subido al nivel **${memberStats.level}**`);

                //Si se recompensó al miembro con roles
                if (rewardedRoles) {

                    //Almacena los nombres de los roles
                    const roleNames = [];

                    //Por cada uno de los roles recompensados
                    for (const roleId of rewardedRoles) {

                        //Busca el rol en la guild
                        const fetchedRole = await client.functions.fetchRole(client.homeGuild, roleId);

                        //Sube al array de nombre, el nombre del rol iterado
                        roleNames.push(fetchedRole.name);
                    };

                    //Añade un campo al embed de levelup con los roles recompensados
                    levelUpEmbed.addField('Recompensas obtenidas', `\`${roleNames.join('`, `')}\``);
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
    client.functions.assignRewards = async (member, memberLevel) => {

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
            if (reward.requiredLevel > memberLevel) break;

            //Si no se deben preservar viejas recompensas, y si el el nivel de la recompensa es menor que el del miembro
            if (client.config.xp.removePreviousRewards && reward.requiredLevel < memberLevel) {

                //Por cada uno de los roles de dicha recompensa
                reward.roles.forEach(async role => {

                    //Le elimina el rol al miembro, si lo tiene
                    if (member.roles.cache.has(role)) await member.roles.remove(role);
                });
            };

            //Si el miembro puede stackear todas las recompensas, o tiene el nivel de esta, se almacena
            if (!client.config.xp.removePreviousRewards || reward.requiredLevel === memberLevel) toReward = toReward.concat(reward.roles);
        };

        //Si hubieron roles a asignar
        if (toReward.length > 0) {

            //Asigna cada uno de ellos
            toReward.forEach(async role => {

                //Si el miembro aún no tiene el rol, se lo añade
                if (!member.roles.cache.has(role)) await member.roles.add(role);
            });

            //Devuelve los roles recompensados
            return toReward;

        };
    };

    //Función para calcular el XP necesario para obtener un nivel determinado
    client.functions.xpToLevel = async level => {

        //Devuelve el resultado
        return (5 * client.config.xp.dificultyModifier) * Math.pow(level, 3) + 50 * level + 100;
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
    client.functions.msToHHMMSS = (ms) => {

        //Convierte a segundos
        let seconds = parseInt(ms / 1000);

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
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
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

    //Función para generar sIDs
    client.functions.sidGenerator = length => {
        
        //Requiere el generador de IDs con un alfabeto personalizado
        const { customAlphabet } = require('nanoid');

        //Asigna el alfabeto y la longitud del ID
        const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10);

        //Devuelve el sID generado
        return nanoid();
    };

    //Función para manejar sintaxis incorrectas
    client.functions.syntaxHandler = (channel, commandConfig) => {
        
        //Genera y envía un embed con la sintaxis correcta
        return channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setTitle(`${client.customEmojis.redTick} Sintaxis incorrecta`)
            .setDescription(`La sintaxis de este comando es:\n\`${client.config.main.prefix}${commandConfig.export.name}${commandConfig.export.parameters.length > 0 ? ` ${commandConfig.export.parameters}` : ''}\``)
        ]});
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
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se pueden enviar mensajes al canal de registro.\n${client.user.username} debe disponer de los siguientes permisos en el canal: Enviar mensajes, Enviar enlaces, Adjuntar archivos.`);
                };

            } catch (error) {

                //Si el canal no es accesible
                if (error.toString().includes('Unknown Channel')) {

                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.loggingChannel = '';
                    client.loggingChannel = null;

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se puede tener acceso al canal de registro.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
                } else {

                    //Muestra un error por consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: Error durante la ejecución del loggingManager:`, error.stack);
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
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se pueden enviar mensajes al canal de registro.\n${client.user.username} debe disponer de los siguientes permisos en el canal: Enviar mensajes, Enviar enlaces, Adjuntar archivos.`);
                };

            } catch (error) {

                //Si el canal no es accesible
                if (error.toString().includes('Unknown Channel')) {

                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.debuggingChannel = '';
                    client.debuggingChannel = null;

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se puede tener acceso al canal de depuración.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
                    
                } else {

                    //Muestra un error por consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: Error durante la ejecución del debuggingManager:`, error.stack);
                };
            };
        };
    };

    //Función para gestionar los errores en los comandos
    client.functions.commandErrorHandler = async (error, message, command, args) => {

        //Se comprueba si el error es provocado por la invocación de un comando no existente
        if (error.toLocaleString().includes('Cannot find module') || error.toLocaleString().includes('Cannot send messages to this user')) return;

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》ERROR:`, error.stack);
        
        //Se comprueba si se han proporcionado argumentos
        const arguments = args.length > 0 ? args.join(' ') : 'Ninguno';

        //Almacena el string del error, y lo recorta si es necesario
        const errorString = error.stack.length > 1014 ? error.stack : `${error.stack.slice(0, 1014)} ...`;

        //Se indica al usuario que se ha notificado el error
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setTitle(`${client.customEmojis.redTick} ¡Vaya! Algo fue mal ...`)
            .setDescription('Lo hemos reportado al equipo de desarrollo')
        ]});

        //Se muestra el error en el canal de depuración¡
        await client.functions.debuggingManager( new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un comando')
            .addField('Comando:', command.slice(-0, -3), true)
            .addField('Argumentos:', arguments, true)
            .addField('Origen:', message.guild.name, true)
            .addField('Canal:', `${message.channel}`, true)
            .addField('Autor:', `${message.author.tag}`, true)
            .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField('Error:', `\`\`\`${errorString}\`\`\``, true)
        );
    };

    //Función para gestionar los errores en los eventos
    client.functions.eventErrorHandler = async (error, eventName) => {

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》ERROR:`, error.stack);
        
        //Almacena el string del error, y lo recorta si es necesario
        const errorString = error.stack.length > 1014 ? error.stack : `${error.stack.slice(0, 1014)} ...`;

        //Se muestra el error en el canal de depuración
        await client.functions.debuggingManager( new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un evento')
            .addField('Evento:', eventName, true)
            .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField('Error:', `\`\`\`${errorString}\`\`\``)
        );
    };

    //Función para generar un footer para los embeds musicales
    client.functions.getMusicFooter = async (targetGuild) => {

        //Stores the footer
        let footer = targetGuild.name;

        //If there is a reproduction queue and a mode has been set
		if (client.reproductionQueues[targetGuild.id] && client.reproductionQueues[targetGuild.id].mode) {

            //Changes the footer to add the symbol of the mode
			switch (client.reproductionQueues[targetGuild.id].mode) {
				case 'shuffle':     footer += ' | 🔀'; break;
				case 'loop':        footer += ' | 🔂'; break;
				case 'loopqueue':   footer += ' | 🔁'; break;
			};
		};

        //Returns the footer
		return footer;
    };

    //Log the result of the functions loading
    console.log(' - [OK] Carga de funciones globales.');
};

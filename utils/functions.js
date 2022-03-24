exports.run = (client) => {
    
    //Crea un objeto para almacenar todas las funciones
    client.functions = {};

    //Función para buscar miembros
    client.functions.fetchMember = async (guild, member) => {
        try {
            let result;
            const matches = member.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await guild.members.fetch(matches[1]);
            } else if (!isNaN(member)) {
                result = await guild.members.fetch(member);
            };
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            return false;
        };
    };

    //Función para buscar usuarios
    client.functions.fetchUser = async  (user) => {
        try {
            let result;
            const matches = user.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await client.users.fetch(matches[1]);
            } else if (!isNaN(user)) {
                result = await client.users.fetch(user);
            };
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            return false;
        };
    };

    //Función para buscar roles
    client.functions.fetchRole = async (guild, role) => {
        try {
            let result;
            const matches = role.match(/^<@&?(\d+)>$/);
            if (matches) {
                result = await guild.roles.fetch(matches[1]);
            } else if (!isNaN(role)) {
                result = await guild.roles.fetch(role);
            };
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
            return false;
        };
    };

    //Función para buscar canales
    client.functions.fetchChannel = async (guild, channel) => {
        try {
            let result;
            const matches = channel.match(/^<#?(\d+)>$/);
            if (matches) {
                result = await guild.channels.fetch(matches[1]);
            } else if (!isNaN(channel)) {
                result = await guild.channels.fetch(channel);
            };
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
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
        let mutedRole = await guild.roles.cache.find(r => r.id === client.config.dynamic.mutedRoleId);

        //Si no existe el rol silenciado (o su nombre es diferente al configurado), lo crea
        if (!mutedRole || mutedRole.name !== client.config.moderation.mutedRoleName) {

            //Borra el anterior rol si es necesario
            if (mutedRole.name !== client.config.moderation.mutedRoleName) await mutedRole.delete('Será reemplazado por uno nuevo.');

            //Crea un nuevo rol silenciado
            mutedRole = await guild.roles.create({
                data: {
                    name: client.config.moderation.mutedRoleName,
                    color: '#818386',
                    permissions: []
                },
                reason: 'Rol para gestionar miembros silenciados'
            });
            
            //Asigna el rol a la posición más alta posible
            let botMember = await guild.members.cache.get(client.user.id);
            await mutedRole.setPosition(botMember.roles.highest.position - 1);

            //Graba el nuevo rol en la configuración
            client.config.dynamic.mutedRoleId = mutedRole.id;

            //Graba el ID en el fichero de configuración
            await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
        };
        
        return mutedRole;
    };

    //Función para propagar el rol silenciado
    client.functions.spreadMutedRole = async (guild) => {
        //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(r => r.id === client.config.dynamic.mutedRoleId);
        //Para cada canal, añade el permiso para el rol
        await guild.channels.cache.forEach(async (channel) => {

            //Ignora este canal si debe estar excluido del silenciamiento
            if (client.config.moderation.mutedRoleExcludedChannels.includes(channel.id)) return;

            //Si el canal tiene un permiso para el rol silenciado, lo almacena
            let mutedRolePermissions = channel.permissionOverwrites.resolve(mutedRole.id);

            //Si el canal no tiene el permiso y el bitfield no coincide con las negaciones pertinentes, añade el permiso
            if (!mutedRolePermissions || ((mutedRolePermissions.deny & BigInt(0x800)) !== BigInt(0x800) || (mutedRolePermissions.deny & BigInt(0x40)) !== BigInt(0x40)) || ((mutedRolePermissions.deny & BigInt(0x200000)) !== BigInt(0x200000))) {
                await channel.permissionOverwrites.edit(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    CONNECT: false
                });
            };
        });
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

    //Función para añadir XP (mode = message || voice)
    client.functions.addXP = async (member, guild, mode, channel) => {
        try {

            //Almacena la tabla de clasificación del servidor, y si no existe la crea
            if (guild.id in client.db.stats === false) {
                client.db.stats[guild.id] = {};
            };
            const guildStats = client.db.stats[guild.id];

            //Para comprobar si el rol puede ganar XP o no.
            let nonXP;
            for (let i = 0; i < client.config.xp.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === client.config.xp.nonXPRoles[i])) {
                    nonXP = true;
                    break;
                };
            };
            if (nonXP) return;

            //Almacena la tabla de clasificación del miembro, y si no existe la crea
            if (member.id in guildStats === false) {
                guildStats[member.id] = {
                    totalXP: 0,
                    actualXP: 0,
                    level: 0,
                    last_message: 0
                };
            };
            const userStats = guildStats[member.id];

            //Genera XP si es un canal de voz o si se ha sobrepasado el umbral de cola de mensajes
            if (mode === 'voice' || (mode === 'message' && Date.now() - userStats.last_message > 5000)) {

                

                //Genera XP y lo guarda
                const newXp = await client.functions.randomIntBetween(client.config.xp.minimumXpReward, client.config.xp.maximumXpReward);
                userStats.actualXP += newXp;
                userStats.totalXP += newXp;
                if (mode === 'message') userStats.last_message = Date.now();

                //Fórmula para calcular el XP necesario para subir de nivel
                const xpToNextLevel = ((5 * client.config.xp.dificultyModifier) * client.config.xp.dificultyModifier) * Math.pow(userStats.level, 3) + 50 * userStats.level + 100;

                //Comprueba si el miembro ha de subir de nivel
                if (userStats.totalXP >= xpToNextLevel) {
                    userStats.level++;
                    userStats.actualXP = ((5 * client.config.xp.dificultyModifier) * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) - userStats.totalXP;

                    //Para cada recompensa, calcula si el miembro es elegible
                    for (let i = client.config.levelingRewards.length - 1; i >= 0; i--) {
                        let reward = client.config.levelingRewards[i];
            
                        //Si el miembro tiene el nivel necesario para la recompensa, se la asigna
                        if (userStats.level >= reward.requiredLevel) {
                            if (userStats.level > 1) {
                                let pastReward = client.config.levelingRewards[i - 1];

                                //Borra cada uno de los roles de la recompensa anterior
                                pastReward.roles.forEach(async role => {
                                    if (member.roles.cache.has(role)) await member.roles.remove(role);
                                });
                            };
            
                            //Asigna cada uno de los roles de la recompensa
                            reward.roles.forEach(async role => {
                                if (!member.roles.cache.has(role)) await member.roles.add(role);
                            });
                            break;
                        };
                    };

                    let levelUpEmbed = new client.MessageEmbed()
                        .setColor(client.config.colors.primary)
                        .setAuthor({ name: '¡Subiste de nivel!', iconURL: member.user.displayAvatarURL({dynamic: true}) })
                        .setDescription(`Enhorabuena <@${member.id}>, has subido al nivel **${userStats.level}**`);

                    //Manda el mensaje de subida de nivel, si se ha configurado
                    if (mode === 'message' && client.config.xp.notifylevelUpOnChat) channel.send({ embeds: [levelUpEmbed] });
                    if (mode === 'voice' && client.config.xp.notifylevelUpOnVoice) member.send({ embeds: [levelUpEmbed] });
                    
                };

                //Guarda las nuevas estadísticas del miembro
                client.fs.writeFile('./databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
                    if (err) throw err;
                });
            };
        } catch (error) {
            console.log(error);
            return false;
        };
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
        let hoursStr = ('00' + hours).slice(-2);
        let minutesStr = ('00' + minutes).slice(-2);
        let secondsStr = ('00' + seconds).slice(-2);

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

    //Función para generar sIDs
    client.functions.sidGenerator = length => {
        
        //Requiere el generador de IDs con un alfabeto personalizado
        const { customAlphabet } = require('nanoid');

        //Asigna el alfabeto y la longitud del ID
        const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10);

        //Devuelve el sID generado
        return nanoid();
    };

    //Función para gestionar el envío de registros al canal de auditoría
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
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se pueden enviar mensajes al canal de auditoría.\n${client.user.username} debe disponer de los siguientes permisos en el canal: Enviar mensajes, Enviar enlaces, Adjuntar archivos.`);
                };
            } catch (error) {
                //Si el canal no es accesible
                if (error.toString().includes('DiscordAPIError')) {

                    console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);

                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.loggingChannel = '';
                    client.loggingChannel = null;

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se puede tener acceso al canal de auditoría.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
                } else {
                    console.error(`${new Date().toLocaleString()} 》ERROR: Error durante la ejecución del loggingManager:`, error);
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
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se pueden enviar mensajes al canal de auditoría.\n${client.user.username} debe disponer de los siguientes permisos en el canal: Enviar mensajes, Enviar enlaces, Adjuntar archivos.`);
                };
            } catch (error) {
                //Si el canal no es accesible
                if (error.toString().includes('DiscordAPIError')) {
                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.debuggingChannel = '';
                    client.debuggingChannel = null;

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: No se puede tener acceso al canal de depuración.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
                } else {
                    console.error(`${new Date().toLocaleString()} 》ERROR: Error durante la ejecución del debuggingManager:`, error);
                };
            };
        };
    };

    //Función para gestionar los errores en los comandos
    client.functions.commandErrorHandler = async (error, message, command, args) => {
        //Se comprueba si el error es provocado por la invocación de un comando no existente
        if (error.toLocaleString().includes('Cannot find module') || error.toLocaleString().includes('Cannot send messages to this user')) return;

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》ERROR: ${error.stack}\n`);
        
        //Se comprueba si se han proporcionado argumentos
        let arguments = 'Ninguno';
        if (args.length > 0) arguments = args.join(' ');

        let errorString = error.stack;
        if (errorString.length > 1014) errorString = `${errorString.slice(0, 1014)} ...`;

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un comando')
            .addField('Comando:', command.slice(-0, -3), true)
            .addField('Argumentos:', arguments, true)
            .addField('Origen:', message.guild.name, true)
            .addField('Canal:', `<#${message.channel.id}>`, true)
            .addField('Autor:', `<@${message.author.id}>`, true)
            .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField('Error:', `\`\`\`${errorString}\`\`\``, true);
        
        let reportedEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setTitle(`${client.customEmojis.redTick} ¡Vaya! Algo fue mal ...`)
            .setDescription('Lo hemos reportado al equipo de desarrollo');
        
        await message.channel.send({ embeds: [reportedEmbed] });
        await client.functions.debuggingManager(debuggEmbed);
    };

    //Función para gestionar los errores en los eventos
    client.functions.eventErrorHandler = async (error, eventName) => {

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》ERROR: ${error.stack}\n`);
        
        let errorString = error.stack;
        if (errorString.length > 1014) errorString = `${errorString.slice(0, 1014)} ...`;

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un evento')
            .addField('Evento:', eventName, true)
            .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField('Error:', `\`\`\`${errorString}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.functions.debuggingManager(debuggEmbed);
    };

    //Función para generar u obtener una invitación permanente
    client.functions.getBotServerInvite = async () => {

        //Almacena la futura invitación
        let foundInvite;

        //Función para crear una invitación
        async function createInvite() {

            //Almacena el canal para crear la invitación
            let inviteChannel;
            
            //Comprueba si hay canal de reglas y si se tiene permiso para crear la invitación
            if (client.homeGuild.rulesChannel && !(client.homeGuild.rulesChannel.permissionsFor(client.user) & BigInt(0x1)) !== BigInt(0x1)) {

                //Almacena el canal de reglas
                inviteChannel = client.homeGuild.rulesChannel;

            } else {

                //De lo contrario, hace lo propio con el primer canal que lo permita
                await client.homeGuild.channels.fetch().then( async channels => {

                    //Filtra los canales para que solo se incluyan los de texto
                    channels = await channels.filter(channel => channel.type === 'GUILD_TEXT')

                    //Hace un mapa de las IDs de los canales
                    const channelIds = channels.map(channel => channel.id);

                    //Comprueba en cada canal si se puede crear la invitación
                    for (index = 0; index < channels.size; index++) {

                        //Obtiene el canal en base a la ID de la lista
                        const channel = channels.get(channelIds[index]);

                        //Si tiene permisos, graba la invitación
                        if(!(channel.permissionsFor(client.user) & BigInt(0x1)) !== BigInt(0x1)) return inviteChannel = channel;
                    };
                });
            };

            //Crea una invitación permanente en el canal
            await inviteChannel.createInvite({maxAge: 0, reason: `Rutina de ${client.user.tag}`}).then(async invite => {foundInvite = invite.code;});

            //Graba la invitación en memoria (en el cliente)
            client.config.dynamic.inviteCode = foundInvite;

            //Graba la invitación en el fichero de configuración
            await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
        };

        //Si no hay una invitación grabada
        if (!client.config.dynamic.inviteCode) {

            //Comprueba si ya existe una invitación
            await client.homeGuild.invites.fetch().then(invites => {
                invites.forEach(async invite => {
                    if (invite.inviter === client.user) foundInvite = invite.code;
                });
            });

            //Crea la invitación si no existe
            if (!foundInvite) await createInvite();

            //Devuelve la URL, si se puedo obtener un código
            if (client.config.dynamic.inviteCode) return `https://discord.gg/${client.config.dynamic.inviteCode}`;

        } else {
            //Busca la invitación
            const invite = await client.homeGuild.invites.resolve(client.config.dynamic.inviteCode);

            //Crea la invitación si no existe
            if (!invite) await createInvite();

            //Devuelve la URL, si se puedo obtener un código
            return `https://discord.gg/${client.config.dynamic.inviteCode}`;
        };
    };

    //Función para generar un footer para los embeds musicales
    client.functions.getMusicFooter = async (targetGuild) => {
        let footer = targetGuild.name;
		if (client.reproductionQueues[targetGuild.id] && client.reproductionQueues[targetGuild.id].mode) {
			switch (client.reproductionQueues[targetGuild.id].mode) {
				case 'shuffle': footer = footer + ` | 🔀`; break;
				case 'loop': footer = footer + ` | 🔂`; break;
				case 'loopqueue': footer = footer + ` | 🔁`; break;
			};
		};
		return footer;
    };

    console.log(' - [OK] Carga de funciones globales.');
};

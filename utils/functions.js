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
            console.log(`${new Date().toLocaleString()} 》${error.stack}`);
            return false;
        };
    };

    //Función para comprobar si existe el rol silenciado, y de no existir, crearlo
    client.functions.checkMutedRole = async (guild) => {

        //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(r => r.name === '🔇 SILENCIADO');

        //Si no existe el rol silenciado, lo crea
        if (!mutedRole) {
            mutedRole = await guild.roles.create({
                data: {
                    name: '🔇 SILENCIADO',
                    color: '#818386',
                    permissions: []
                },
                reason: 'Rol para gestionar miembros silenciados'
            });
            
            //Asigna el rol a la posición más alta posible
            let botMember = await guild.members.cache.get(client.user.id);
            await mutedRole.setPosition(botMember.roles.highest.position - 1);
        };
        return mutedRole;
    };

    //Función para propagar el rol silenciado
    client.functions.spreadMutedRole = async (guild) => {
        //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(r => r.name === '🔇 SILENCIADO');
        //Para cada canal, añade el permiso para el rol
        await guild.channels.cache.forEach(async (channel) => {

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
                const newXp = await client.functions.randomIntBetween(5, 15);
                userStats.actualXP += newXp;
                userStats.totalXP += newXp;
                if (mode === 'message') userStats.last_message = Date.now();

                //Fórmula parra calcular el XP necesario para subir de nivel
                const xpToNextLevel = 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100;

                //Comprueba si el miembro ha de subir de nivel
                if (userStats.totalXP >= xpToNextLevel) {
                    userStats.level++;
                    userStats.actualXP = (5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) - userStats.totalXP;

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

    //Función para cargar los emojis necesarios en la guild base
    client.functions.uploadSystemEmojis = async () => {

        //TIER 0: 50 emojis + 50 animojis
        //TIER 1: 100 emojis + 100 animojis
        //TIER 2: 150 emojis + 150 animojis
        //TIER 3: 250 emojis + 250 animojis

        //Cálculo de umbral de emojis por tier de guild
        let emojisThreshold;

        switch (client.homeGuild.premiumTier) {
            case 'NONE':
                emojisThreshold = 50;
                break;
            case 'TIER_1':
                emojisThreshold = 100;
                break;
            case 'TIER_2':
                emojisThreshold = 150;
                break;
            case 'TIER_3':
                emojisThreshold = 250;
                break;
        };

        //Listado de emojis normales (sin animar) de la guild
        const normalGuildEmojis = await client.homeGuild.emojis.fetch().then(emojis => emojis.filter(emoji => !emoji.animated).map(emoji => emoji.id));

        //Listado de emojis a cargar en la guild
        const customEmojis = require('../databases/customEmojis.json');
        const emojis = Object.keys(customEmojis);

        //Creación de nuevos emojis en la guild
        if ((normalGuildEmojis.length + emojis.length) <= emojisThreshold) {

            //Promesa para comprobar la existencia de los customEmojis, y crearlos en caso negativo
            const emojiCreation = new Promise((resolve, reject) => {
                emojis.forEach(async (emojiName, index, array) => {
    
                    //Omite este emoji si ya está presente en la guild
                    if (normalGuildEmojis.includes(customEmojis[emojiName])) return;
    
                    //Crea el emoji
                    await client.homeGuild.emojis.create(`./resources/emojis/${emojiName}.png`, emojiName, `Necesario para el funcionamiento de ${client.user.username}.`)
                        .then(emoji => {
                            customEmojis[emojiName] = emoji.id;
                            console.log(`- Emoji [${emoji.name}] creado satisfactoriamente.`)
                        });
    
                    //Resuelve la promesa
                    if (index === array.length -1) resolve();
                });
            });
            
            //Graba los nuevos customEmojis en la configuración tras resolver la promesa
            emojiCreation.then(async () => {
                await client.fs.writeFile('./databases/customEmojis.json', JSON.stringify(client.config.customEmojis, null, 4), (err) => console.error(err));
            });
        } else {
            console.log(`\nNo habían espacios para emojis suficientes.\nNecesitas al menos ${emojis.length} espacios.\nSe usarán emojis Unicode en su lugar.\n`);
        };
    };

    //Función para gestionar el envío de registros al canal de auditoría
    client.functions.loggingManager = async (embed) => {

        //Comprobar si el canal está configurado y almacenado en memoria
        if (client.config.main.loggingChannel && client.loggingChannel) {

            try {
                //Carga los permisos del bot en el canal de logging
                const channelPermissions = client.loggingChannel.permissionsFor(client.user);
                const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000));

                //Comprueba si el bot tiene permisos para mandar el embed
                if (!missingPermission) {
                    await client.loggingChannel.send({ embeds: [embed] }); //Enviar el mensaje al canal
                } else {
                    //Advertir por consola de que no se tienen permisos
                    console.error(`${new Date().toLocaleString()} 》Error: No se pueden enviar mensajes al canal de auditoría.\n${client.user.username} debe disponer de los siguientes permisos en el canal: Enviar mensajes, Enviar enlaces.`);
                };
            } catch (error) {
                //Si el canal no es accesible
                if (error.toString().includes('DiscordAPIError')) {

                    console.log(`${new Date().toLocaleString()} 》${error.stack}`);

                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.loggingChannel = '';
                    client.loggingChannel = null;

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), (err) => console.error(err));

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》Error: No se puede tener acceso al canal de auditoría.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);
                } else {
                    console.error(`${new Date().toLocaleString()} 》Error durante la ejecución del loggingManager:`, error);
                };
            };
        };
    };

    //Función para gestionar el envío de registros al canal de depuración
    client.functions.debuggingManager = async (embed) => {
        
        //Comprobar si el canal está configurado y almacenado en memoria
        if (client.config.main.debuggingChannel && client.debuggingChannel) {

            try {
                //Carga los permisos del bot en el canal de debugging
                const channelPermissions = client.debuggingChannel.permissionsFor(client.user);
                const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000));

                //Comprueba si el bot tiene permisos para mandar el embed
                if (!missingPermission) {
                    await client.debuggingChannel.send({ embeds: [embed] }); //Enviar el mensaje al canal
                } else {
                    //Advertir por consola de que no se tienen permisos
                    console.error(`${new Date().toLocaleString()} 》Error: No se pueden enviar mensajes al canal de auditoría.\n${client.user.username} debe disponer de los siguientes permisos en el canal: Enviar mensajes, Enviar enlaces.`);
                };
            } catch (error) {
                //Si el canal no es accesible
                if (error.toString().includes('DiscordAPIError')) {
                    //Borrarlo de la config y descargarlo de la memoria
                    client.config.main.debuggingChannel = '';
                    client.debuggingChannel = null;

                    //Graba la nueva configuración en el almacenamiento
                    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), (err) => console.error(err));

                    //Advertir por consola
                    console.error(`${new Date().toLocaleString()} 》Error: No se puede tener acceso al canal de depuración.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);
                } else {
                    console.error(`${new Date().toLocaleString()} 》Error durante la ejecución del debuggingManager:`, error);
                };
            };
        };
    };

    //Función para gestionar los errores en los comandos
    client.functions.commandErrorHandler = async (error, message, command, args) => {
        //Se comprueba si el error es provocado por la invocación de un comando no existente
        if (error.toLocaleString().includes('Cannot find module') || error.toLocaleString().includes('Cannot send messages to this user')) return;

        //Se muestra el error en consola
        console.error(`\n${new Date().toLocaleString()} 》${error.stack}\n`);
        
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
            .addField('Fecha:', new Date().toLocaleString(), true)
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
        console.error(`\n${new Date().toLocaleString()} 》${error.stack}\n`);
        
        let errorString = error.stack;
        if (errorString.length > 1014) errorString = `${errorString.slice(0, 1014)} ...`;

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un evento')
            .addField('Evento:', eventName, true)
            .addField('Fecha:', new Date().toLocaleString(), true)
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
                inviteChannel = client.homeGuild.rulesChannel;
            } else {
                //De lo contrario, hace lo propio con el primer canal que lo permita
                await client.homeGuild.channels.filter(channel => channel.type === 'text').then(async channels => {

                    //Compreba en cada canal si se puede crear la invitación
                    await channels.forEach(async channel => {

                        //Si pudo, graba la invitación
                        if(!(channel.permissionsFor(client.user) & BigInt(0x1)) !== BigInt(0x1)) return inviteChannel = channel;
                    });

                    //Si no, asigna "client.config.main.homeGuildInviteCode" cómo falso
                    if (!inviteChannel) client.config.main.homeGuildInviteCode = false;
                });
            };

            //Crea una invitación permanente en el canal de reglas
            await inviteChannel.createInvite({maxAge: 0, reason: `Rutina de ${client.user.tag}`}).then(async invite => {foundInvite = invite.code;});

            //Graba la invitación en el fichero de configuración
            client.config.main.homeGuildInviteCode = foundInvite;
            await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), (err) => console.error(err));
        };

        //Si no hay una invitación grabada
        if (!client.config.main.homeGuildInviteCode) {

            //Comprueba si ya existe una invitación
            await client.homeGuild.invites.fetch().then(invites => {
                invites.forEach(async invite => {
                    if (invite.inviter === client.user) foundInvite = invite.code;
                });
            });

            //Crea la invitación si no existe
            if (!foundInvite) await createInvite();

            //Devuelve la URL, si se puedo obtener un código
            if (client.config.main.homeGuildInviteCode) return `https://discord.gg/${client.config.main.homeGuildInviteCode}`;

        } else {
            //Busca la invitación
            const invite = await client.homeGuild.invites.resolve(client.config.main.homeGuildInviteCode);

            //Crea la invitación si no existe
            if (!invite) await createInvite();

            //Devuelve la URL, si se puedo obtener un código
            return `https://discord.gg/${client.config.main.homeGuildInviteCode}`;
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

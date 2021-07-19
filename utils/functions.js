exports.run = (discord, client) => {
    
    //Crea un objeto para almacenar todas las funciones
    client.functions = {};

    //Función para buscar miembros
    client.functions.fetchMember = async (guild, argument) => {
        try {
            let result;
            const matches = argument.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await guild.members.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await guild.members.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            return false;
        }
    };

    //Función para buscar usuarios
    client.functions.fetchUser = async  (argument) => {
        try {
            let result;
            const matches = argument.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await client.users.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await client.users.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            return false;
        }
    };

    //Función para buscar roles
    client.functions.fetchRole = async (guild, argument) => {
        try {
            let result;
            const matches = argument.match(/^<@&?(\d+)>$/);
            if (matches) {
                result = await guild.roles.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await guild.roles.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (error) {
            return false;
        }
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
            let mutedRolePermissions = channel.permissionOverwrites.get(mutedRole.id);

            //Si el canal no tiene el permiso y el bitfield no coincide con las negaciones pertinentes, añade el permiso
            if (!mutedRolePermissions || ((mutedRolePermissions.deny & 0x800) !== 0x800) || ((mutedRolePermissions.deny & 0x40) !== 0x40) || ((mutedRolePermissions.deny & 0x200000) !== 0x200000)) {
                await channel.updateOverwrite(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    CONNECT: false
                });
            };
        });
    };

    //Función para añadir XP (mode = message || voice)
    client.functions.addXP = async (member, guild, mode, channel) => {
        try {
            
            //Utilidad para generar números aletorios
            const random = require('random');

            //Almacena la tabla de clasificación del servidor, y si no existe la crea
            if (guild.id in client.stats === false) {
                client.stats[guild.id] = {};
            };
            const guildStats = client.stats[guild.id];

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
                const newXp = random.int(5, 15);
                userStats.actualXP += newXp;
                userStats.totalXP += newXp;
                if (mode === 'message') userStats.last_message = Date.now();

                //Fórmula parra calcular el XP necesario para subir de nivel
                const xpToNextLevel = 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100;

                //Comprueba si el miembro ha de subir de nivel
                if (userStats.totalXP >= xpToNextLevel) {
                    userStats.level++;
                    userStats.actualXP = (5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) - userStats.totalXP;

                    //Almacena las recompensas por nivel
                    const rewards = require('../configs/levelingRewards.json');

                    //Para cada recompensa, calcula si el miembro es elegible
                    for (let i = rewards.length - 1; i >= 0; i--) {
                        let reward = rewards[i];
            
                        //Si el miembro tiene el nivel necesario para la recompensa, se la asigna
                        if (userStats.level >= reward.requiredLevel) {
                            if (userStats.level > 1) {
                                let pastReward = rewards[i - 1];

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

                    let levelUpEmbed = new discord.MessageEmbed()
                        .setAuthor(`¡Subiste de nivel!`, member.user.displayAvatarURL())
                        .setColor(client.colors.primary)
                        .setDescription(`Enhorabuena <@${member.id}>, has subido al nivel **${userStats.level}**`);

                    //Manda el mensaje de subida de nivel
                    if (mode === 'message') channel.send(levelUpEmbed);
                    if (mode === 'voice') member.send(levelUpEmbed);
                };

                //Guarda las nuevas estadísticas del miembro
                client.fs.writeFile(`./databases/stats.json`, JSON.stringify(client.stats, null, 4), async err => {
                    if (err) throw err;
                });
            };
        } catch (error) {
            console.log(e);
            return false;
        };
    };

    //Función para convertir de HH:MM:SS a Segundos
    client.functions.hmsToSeconds = (str) => {
        var p = str.split(':'),
            s = 0, m = 1;

        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }

        return s;
    };

    //Función para evaluar si se necesitan votos o puede continuar
    client.functions.evaluateDjOrVotes = async (message, command, index) => {

        //Omite si no hay roles de DJ
        if (client.config.music.djRoles.length == 0) return true;

        let server = client.queues[message.guild.id];

        //Omite si no hay reproducción
        if (!server || !server.nowplaying || !server.nowplaying.requestedById) return true;

        //Calcula a qué posición de la cola ha de acceder para realizar comprobaciones
        if (index == 0) {
            if (message.member.id === server.nowplaying.requestedById) return true;
        } else if (index > 0) {
            if (message.member.id === server.queue[index - 1].requestedById) return true;
        };
        
        //Comprueba si el miembro es DJ, y de serlo omite la comprobación de votos
        for (let i = 0; i < client.config.music.djRoles.length; i++) {
            if (await message.member.roles.cache.find(r => r.id === client.config.music.djRoles[i])) {
                return true;
            };
        };

        //Variable necesaria para calcular los votos y los permisos
        let actualVotes;

        //Crea e inicializa el contador de votos raíz si no lo estaba ya
        if (!server.votes[command]) server.votes[command] = [];
        let counter = server.votes[command];

        //Si se activa el modo "por miembro"
        if (index) {
            if (!counter[index]) counter[index] = []; //Crea e inicializa el contador de votos hijo si no lo estaba ya
            if (!counter[index].includes(message.member.id)) counter[index].push(message.member.id); //Si el miembro no ha votado, añade su voto
            actualVotes = counter[index].length; //Actualiza el contador de votos
        } else {
            if (!counter.includes(message.member.id)) counter.push(message.member.id); //Si el miembro no ha votado, añade su voto
            actualVotes = counter.length; //Actualiza el contador de votos
        };

        //Graba el nuevo contador de votos
        server.votes[command] = counter;

        //Almacena variables necesarias para calcular los votos
        const memberCount = message.member.voice.channel.members.size - 1;
        const actualPercentage = (actualVotes / memberCount) * 100;
        const requiredPercentage = client.config.music.votesPercentage;
        const requiredVotes = Math.round((actualVotes * requiredPercentage) / actualPercentage);

        //Maneja la cantidad de votos necesarios para realizar la acción
        if (actualPercentage < client.config.music.votesPercentage) {
            message.channel.send(`🗳 | Votos necesarios: \`${actualVotes}\` de \`${requiredVotes}\``);
            return false;
        } else {
            server.votes[command] = 0;
            return true;
        };
    };

    //Función para cargar los emojis necesarios en la guild base
    client.functions.uploadSystemEmojis = async () => {

        /* - - - EXPERIMENTAL - - - */

        //TIER 0: 50 emojis + 50 animojis
        //TIER 1: 100 emojis + 100 animojis
        //TIER 2: 150 emojis + 150 animojis
        //TIER 3: 250 emojis + 250 animojis

        //Cálculo de umbral de emojis por tier de guild
        let emojisThreshold;

        switch (client.homeGuild.premiumTier) {
            case 0:
                emojisThreshold = 50;
                break;
            case 1:
                emojisThreshold = 100;
                break;
            case 2:
                emojisThreshold = 150;
                break;
            case 3:
                emojisThreshold = 250;
                break;
        };

        //Listado de emojis normales (sin animar) de la guild
        const normalGuildEmojis = client.homeGuild.emojis.cache.filter(emoji => !emoji.animated).map(emoji => emoji.id);

        //Listado de emojis a cargar en la guild
        const emojis = Object.keys(client.config.customEmojis);

        //Creación de nuevos emojis en la guild
        if ((normalGuildEmojis.length + emojis.length) <= emojisThreshold) {

            //Promesa para comprobar la existencia de los customEmojis, y crearlos en caso negativo
            const emojiCreation = new Promise((resolve, reject) => {
                emojis.forEach(async (emojiName, index, array) => {
    
                    //Omite este emoji si ya está presente en la guild
                    if (normalGuildEmojis.includes(client.config.customEmojis[emojiName])) return;
    
                    //Crea el emoji
                    await client.homeGuild.emojis.create(`./resources/emojis/${emojiName}.png`, emojiName, `Necesario para el funcionamiento de ${client.user.username}.`)
                        .then(emoji => {
                            client.config.customEmojis[emojiName] = emoji.id;
                            console.log(`- Emoji [${emoji.name}] creado satisfactoriamente.`)
                        });
    
                    //Resuelve la promesa
                    if (index === array.length -1) resolve();
                });
            });
            
            //Graba los nuevos customEmojis en la configuración tras resolver la promesa
            emojiCreation.then(async () => {
                await client.fs.writeFile('./configs/customEmojis.json', JSON.stringify(client.config.customEmojis, null, 4), (err) => console.error);
            });
        } else {
            console.log(`No habían espacios para emojis suficientes.\nNecesitas al menos ${emojis.length} espacios.\nSe usarán emojis Unicode en su lugar.`);
        };
    };
};

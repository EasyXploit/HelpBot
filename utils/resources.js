exports.run = (discord, client) => {
    
    //SERVIDOR PRINCIPAL
    const server = client.guilds.cache.get('374945492133740544');
    module.exports.server = server;

    //FUNCIONES
    //Función para buscar miembros
    async function fetchMember(guild, argument) {
        try {
            let result;
            const matches = argument.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await guild.members.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await guild.members.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (e) {
            return false;
        }
    };
    module.exports.fetchMember = fetchMember;

    //Función para buscar usuarios
    async function fetchUser(argument) {
        try {
            let result;
            const matches = argument.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await client.users.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await client.users.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (e) {
            return false;
        }
    };
    module.exports.fetchUser = fetchUser;

    //Función para buscar roles
    async function fetchRole(guild, argument) {
        try {
            let result;
            const matches = argument.match(/^<@&?(\d+)>$/);
            if (matches) {
                result = await guild.roles.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await guild.roles.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (e) {
            return false;
        }
    };
    module.exports.fetchRole = fetchRole;

    //Función para comprobar si existe el rol silenciado, y de no existir, crearlo
    async function checkMutedRole(guild) {

        //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(r => r.name === 'Silenciado');

        //Si no existe el rol silenciado, lo crea
        if (!mutedRole) {
            mutedRole = await guild.roles.create({
                data: {
                    name: 'Silenciado',
                    color: '#818386',
                    permissions: []
                },
                reason: 'Rol para gestionar usuarios silenciados'
            });
            
            //Asigna el rol a la posición más alta posible
            let botMember = await guild.members.cache.get(client.user.id);
            await mutedRole.setPosition(botMember.roles.highest.position - 1);
        };
        return mutedRole;
    };
    module.exports.checkMutedRole = checkMutedRole;

    //Función para propagar el rol silenciado
    async function spreadMutedRole(guild) {
         //Busca el rol silenciado
        let mutedRole = await guild.roles.cache.find(r => r.name === 'Silenciado');
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
    module.exports.spreadMutedRole = spreadMutedRole;

    //Función para añadir XP (mode = message || voice)
    async function addXP(fs, config, member, guild, mode, channel) {
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
            for (let i = 0; i < config.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === config.nonXPRoles[i])) {
                    nonXP = true;
                    break;
                };
            };
            if (nonXP) return;

            //Almacena la tabla de clasificación del usuario, y si no existe la crea
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
                if (userStats.actualXP >= xpToNextLevel) {
                    userStats.level++;
                    userStats.actualXP = userStats.actualXP - xpToNextLevel;

                    //Almacena las recompensas por nivel
                    const rewards = require('./leveling/rewards.json');

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
                        .setColor(gold)
                        .setAuthor(`¡Subiste de nivel!`, member.user.displayAvatarURL())
                        .setDescription(`Enhorabuena <@${member.id}>, has subido al nivel **${userStats.level}**`);

                    //Manda el mensaje de subida de nivel
                    if (mode === 'message') channel.send(levelUpEmbed);
                    if (mode === 'voice') member.send(levelUpEmbed);
                };

                //Guarda las nuevas estadísticas del usuario
                fs.writeFile(`./storage/stats.json`, JSON.stringify(client.stats, null, 4), async err => {
                    if (err) throw err;
                });
            };
        } catch (e) {
            console.log(e);
            return false;
        };
    };
    module.exports.addXP = addXP;

    //Función para convertir de HH:MM:SS a Segundos
    function hmsToSeconds(str) {
        var p = str.split(':'),
            s = 0, m = 1;
    
        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }
    
        return s;
    };
    module.exports.hmsToSeconds = hmsToSeconds;

    //Función para evaluar si se necesitan votos o puede continuar
    async function evaluateDjOrVotes(message, command, index) {

        //Omite si no hay roles de DJ
        if (client.musicConfig.djRoles.length == 0) return true;

        //Calcula a qué posición de la cola ha de acceder para realizar comprobaciones
        if (index == 0) {
            if (message.member.id === client.servers[message.guild.id].nowplaying.requestedById) return true;
        } else if (index > 0) {
            if (message.member.id === client.servers[message.guild.id].queue[index - 1].requestedById) return true;
        };
        
        //Comprueba si el miembro es DJ, y de serlo omite la comprobación de votos
        for (let i = 0; i < client.musicConfig.djRoles.length; i++) {
            if (await message.member.roles.cache.find(r => r.id === client.musicConfig.djRoles[i])) {
                return true;
            };
        };

        //Variable necesaria para calcular los votos y los permisos
        let actualVotes;

        //Crea e inicializa el contador de votos raíz si no lo estaba ya
        if (!client.servers[message.guild.id].votes[command]) client.servers[message.guild.id].votes[command] = [];
        let counter = client.servers[message.guild.id].votes[command];

        //Si se activa el modo "por usuario"
        if (index) {
            if (!counter[index]) counter[index] = []; //Crea e inicializa el contador de votos hijo si no lo estaba ya
            if (!counter[index].includes(message.member.id)) counter[index].push(message.member.id); //Si el miembro no ha votado, añade su voto
            actualVotes = counter[index].length; //Actualiza el contador de votos
        } else {
            if (!counter.includes(message.member.id)) counter.push(message.member.id); //Si el miembro no ha votado, añade su voto
            actualVotes = counter.length; //Actualiza el contador de votos
        };

        //Graba el nuevo contador de votos
        client.servers[message.guild.id].votes[command] = counter;

        //Almacena variables necesarias para calcular los votos
        const memberCount = message.member.voice.channel.members.size - 1;
        const actualPercentage = (actualVotes / memberCount) * 100;
        const requiredPercentage = client.musicConfig.votesPercentage;
        const requiredVotes = Math.round((actualVotes * requiredPercentage) / actualPercentage);

        //Maneja la cantidad de votos necesarios para realizar la acción
        if (actualPercentage < client.musicConfig.votesPercentage) {
            message.channel.send(`🗳 | Votos necesarios: \`${actualVotes}\` de \`${requiredVotes}\``);
            return false;
        } else {
            client.servers[message.guild.id].votes[command] = 0;
            return true;
        };
    };
    module.exports.evaluateDjOrVotes = evaluateDjOrVotes;


    //COLORES
    const gold = '0xFFC857';
    module.exports.gold = gold;
    
    const red = '0xF12F49';
    module.exports.red = red;
    
    const red2 = '0xF04647';
    module.exports.red2 = red2;
    
    const green = '0x3EB57B';
    module.exports.green = green;
    
    const green2 = '0xB8E986';
    module.exports.green2 = green2;
    
    const gray = '0xC6C9C6';
    module.exports.gray = gray;
    
    const blue = '0x4A90E2';
    module.exports.blue = blue;
    
    const blue2 = '0x7CD6F9';
    module.exports.blue2 = blue2;
    
    const orange = '0xF8A41E';
    module.exports.orange = orange;
    
    const brown = `0xCBAC88`;
    module.exports.brown = brown;
    
    const lilac = `0xA3B3EE`;
    module.exports.lilac = lilac;
    
    //VARIABLES MODIFICABLES
    const valueCheck = 'null';
    module.exports.valueCheck = valueCheck;
    
    //EMOJIS
    const banned = client.emojis.cache.get('437727132660138024');
    module.exports.banned = banned;

    const GreenTick = client.emojis.cache.get('496633289726099478');
    module.exports.GreenTick = GreenTick;
    
    const GrayTick = client.emojis.cache.get('496633289809854474');
    module.exports.GrayTick = GrayTick;
    
    const RedTick = client.emojis.cache.get('496633289528836108');
    module.exports.RedTick = RedTick;
    
    const OrangeTick = client.emojis.cache.get('499215590741901312');
    module.exports.OrangeTick = OrangeTick;
    
    const beta = client.emojis.cache.get('496633935174828034');
    module.exports.beta = beta;

    const dj = client.emojis.cache.get('757768901693145249');
    module.exports.dj = dj;
    
    const fortnite = client.emojis.cache.get('496633644954419210');
    module.exports.fortnite = fortnite;
    
    const pilkobot = client.emojis.cache.get('496633714802032655');
    module.exports.pilkobot = pilkobot;
    
    const republicagamer = client.emojis.cache.get('498288236607569962');
    module.exports.republicagamer = republicagamer;
    
    const musicBox = client.emojis.cache.get('503128880933240832');
    module.exports.musicBox = musicBox;
    
    const shield = client.emojis.cache.get('499209508275355648');
    module.exports.shield = shield;
    
    const coin = client.emojis.cache.get('496634668758859786');
    module.exports.coin = coin;
    
    const nitro = client.emojis.cache.get('496633448686157826');
    module.exports.nitro = nitro;
    
    const verified = client.emojis.cache.get('496633324010471424');
    module.exports.verified = verified;
    
    const boxbot = client.emojis.cache.get('497178946149023744');
    module.exports.boxbot = boxbot;
    
    const drakeban = client.emojis.cache.get('497381029011521593');
    module.exports.drakeban = drakeban;
    
    const translate = client.emojis.cache.get('503248605814063105');
    module.exports.translate = translate;
    
    const rythm = client.emojis.cache.get('507187604031275008');
    module.exports.rythm = rythm;
    
    const rythm2 = client.emojis.cache.get('507187615402033155');
    module.exports.rythm2 = rythm2;

    const chevron10 = client.emojis.cache.get('497133468535226389');
    module.exports.chevron10 = chevron10;
    
    const chevron11 = client.emojis.cache.get('497133469495721986');
    module.exports.chevron11 = chevron11;
    
    const chevron = client.emojis.cache.get('497133469110108189');
    module.exports.chevron = chevron;
    
    const chevron5 = client.emojis.cache.get('497133468791341116');
    module.exports.chevron5 = chevron5;
    
    const chevron9 = client.emojis.cache.get('497133468741009411');
    module.exports.chevron9 = chevron9;
    
    const chevron15 = client.emojis.cache.get('497133469059645460');
    module.exports.chevron15 = chevron15;
    
    const chevron18 = client.emojis.cache.get('497133469529538560');
    module.exports.chevron18 = chevron18;
}
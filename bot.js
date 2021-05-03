'use-strict';

const logo = require('asciiart-logo');
const package = require('./package.json');

console.log(
    logo({
        name: 'PilkoBot',
        font: 'Speed',
        lineChars: 15,
        padding: 5,
        margin: 2
    })
    .emptyLine()
    .right(`Versión ${package.version}`)
    .emptyLine()
    .wrap(`PilkoBot es un bot multifuncional desarrollado por el Staff de la comunidad, cuyo uso es exclusivo de los usuarios de la República Gamer, por lo que no está permitido su uso fuera de los servidores administrados por la República Gamer S.L..`)
    .render()
);

console.log(`》Iniciando aplicación «\n―――――――――――――――――――――――― \n${new Date().toLocaleString()}\n`);

//DEPENDENCIAS GLOBALES
const discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const cleverbot = require('cleverbot-free');
const keys = require('./configs/keys.json');
const client = new discord.Client({
    fetchAllMembers: true,
    disableEveryone: true,
    disabledEvents: ['TYPING_START', 'TYPING_STOP'],
    autoReconnect: true,
    retryLimit: Infinity 
});

//CONFIGURACIONES
const config = require('./configs/config.json');
const filters = require('./utils/automod/filters.json');
const commandsConfig = require('./configs/commands.json');

//CONFIGURACIONES GLOBALES
client.musicConfig = require('./configs/music.json');
client.homeGuild = config.homeGuild;

//RECURSOS GLOBALES
let resources = require('./utils/resources.js');
const automodFilters = require('./utils/automod/automodFilters.js')

//USUARIOS QUE USARON COMANDOS RECIENTEMENTE
const talkedRecently = new Set();

//DATOS PERSISTENTES
client.mutes = JSON.parse(fs.readFileSync('./storage/mutes.json', 'utf-8'));
client.bans = JSON.parse(fs.readFileSync('./storage/bans.json', 'utf-8'));
client.polls = JSON.parse(fs.readFileSync('./storage/polls.json', 'utf-8'));
client.stats = JSON.parse(fs.readFileSync('./storage/stats.json', 'utf-8'));
client.warns = JSON.parse(fs.readFileSync('./storage/warns.json', 'utf-8'));

//VOZ
client.servers = {}; //Almacena la cola y otros datos
client.voiceStatus = true; //Almacena la disponiblidad del bot
client.voiceDispatcher; //Almacena el dispatcher
client.voiceConnection; //Almacena la conexión
client.voiceTimeout; //Almacena los timeouts de reproducción finalizada
client.usersVoiceStates = {}; //Almacena los cambios de estado de voz de los usuarios

//DMs
client.dmContexts = {};

// COMPROBACIÓN DE INICIO DE SESIÓN Y PRESENCIA
client.on('ready', async () => {

    try {
        client.homeGuild = client.guilds.cache.get(client.homeGuild);
        const debuggingChannel = client.channels.cache.get(config.debuggingChannel);

        //Recursos globales
        resources.run(discord, client);
        resources = require('./utils/resources.js');

        //Comprobación del estado de voz de los usuarios
        let voiceStates = resources.server.voiceStates.cache;
        voiceStates.forEach(async voiceState => {

            //No sigue si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            const member = await resources.fetchMember(voiceState.guild, voiceState.id);
            if (!member) return;

            let nonXPRole;
            for (let i = 0; i < config.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === config.nonXPRoles[i])) {
                    nonXPRole = true;
                    break;
                };
            };

            if (member.user.bot || config.nonXPChannels.includes(voiceState.channelID) || voiceState.channelID === voiceState.guild.afkChannel.id || nonXPRole) {
                if (client.usersVoiceStates[voiceState.id]) {
                    //Borra el registro del miembro que ha dejado el canal de voz
                    delete client.usersVoiceStates[voiceState.id];
                }
                return;
            };

            if (client.usersVoiceStates[voiceState.id]) {
                client.usersVoiceStates[voiceState.id].channelID = voiceState.channelID
            } else  {
                client.usersVoiceStates[voiceState.id] = {
                    guild: voiceState.guild.id,
                    channelID: voiceState.channelID,
                    last_xpReward: Date.now()
                };
            };
        });

        //Carga de intervalos
        require('./utils/intervals.js').run(discord, client, fs, resources, moment, config);

        //Auditoría
        console.log(` 》${client.user.username} iniciado correctamente \n  ● Estatus: ${config.status}\n  ● Tipo de actividad: ${config.type}\n  ● Actividad: ${config.game}\n`);

        let statusEmbed = new discord.MessageEmbed()
            .setTitle('📑 Estado de ejecución')
            .setColor(resources.gold)
            .setDescription(`${client.user.username} iniciado correctamente`)
            .addField('Estatus:', config.status, true)
            .addField('Tipo de actividad:', config.type, true)
            .addField('Actividad:', config.game, true)
            .addField('Usuarios:', client.users.cache.filter(user => !user.bot).size, true)
            .addField('Versión:', package.version, true)
            .setFooter(`${client.user.username} • Este mensaje se borrará en 10s`, client.user.avatarURL());
        debuggingChannel.send(statusEmbed).then(msg => {msg.delete({timeout: 10000})});
        debuggingChannel.send(`<@${config.botOwner}>`).then(msg => {msg.delete({timeout: 1000})});
    } catch (e) {
        console.error(`${new Date().toLocaleString()} 》${e.stack}`);
    }
});

// MANEJADOR DE EVENTOS
fs.readdir('./events/', async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(`.`)[0];

        if (eventName === 'guildBanAdd') {
            client.on(eventName, (guild, user) => {
                eventFunction.run(guild, user, discord, fs, config, keys, client, resources);
            });
        } else if (eventName === 'voiceStateUpdate') {
            client.on(eventName, (oldState, newState) => {
                eventFunction.run(oldState, newState, discord, fs, config, keys, client, resources);
            });
        } else {
            client.on(eventName, event => {
                eventFunction.run(event, discord, fs, config, keys, client, resources);
            });
        }

        console.log(` - Evento [${eventName}] cargado`);
    });
    console.log('\n');
});

// MANEJADOR DE COMANDOS
client.on('message', async message => {

    //Previene que continue la ejecución si el servidor no es la República Gamer
    if (message.guild && message.guild.id !== client.homeGuild.id) return;
    
    const debuggingChannel = client.channels.cache.get(config.debuggingChannel);
    const loggingChannel = client.channels.cache.get(config.loggingChannel);
    const pilkoChatChannel = client.channels.cache.get(config.pilkoChatChannel);

    if (message.channel.id === '550420589458751526' && message.author.id !== '359333470771740683' && message.author.id !== '474051954998509571') return message.delete({timeout: 5000});

    if (message.author.bot || message.type !== 'DEFAULT') return;
    if (message.channel.type === 'dm') {
        if (message.author.id === '507668335547252747' || message.author.id === '468149377412890626') {
            let prefix = message.content.slice(0, 1);
            let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
            let command = args.shift().toLowerCase();
            
            if (prefix !== '-' || command !== 'ban' || !args[0]  || !args[1]) return;
            
            let member = await resources.server.fetchMember(args[0]);
            
            console.log(`${new Date().toLocaleString()} 》Se ha recibido una orden automática de baneo para ${member.user.tag} (${member.id})`);

            let spamMessage = message.content.slice(6 + args[0].length);
            
            let loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setAuthor(`${member.user.tag} ha sido BANEADO`, member.user.displayAvatarURL())
                .addField('Miembro', member.user.tag, true)
                .addField('Moderador', '<@468149377412890626>', true)
                .addField('Razón', 'Spam vía MD', true)
                .addField('Mensaje', spamMessage, true)
                .addField('Duración', '∞', true);
            
            await loggingChannel.send(loggingEmbed).then(resources.server.ban(member.id, {reason: 'Spam vía MD'}));
            
            return;
        } else {
            const noDMEmbed = new discord.MessageEmbed()
                .setColor(resources.gray)
                .setDescription(`${resources.GrayTick} | Por el momento, los comandos de **${client.user.username}** solo está disponible desde el servidor de la **República Gamer**.`);
            
            if (!message.content) return;
            if (message.content.startsWith(config.prefix) || message.content.startsWith(config.staffPrefix) || message.content.startsWith(config.ownerPrefix)) return await message.author.send(noDMEmbed);
 
            const pilkoChatEmbed = new discord.MessageEmbed()
                .setColor(resources.blue2)
                .setAuthor(`Mensaje de: ${message.author.tag}`, message.author.displayAvatarURL())
                .setDescription(message.content);

            await pilkoChatChannel.send(pilkoChatEmbed);

            if (!client.dmContexts[message.author.id]) client.dmContexts[message.author.id] = ['Hablemos en Español'];

            return await cleverbot(message.content, client.dmContexts[message.author.id]).then(async response => {
                if (client.dmContexts[message.author.id] && !message.content.includes('http')) client.dmContexts[message.author.id].push(message.content);

                    let dmChannel = message.author.dmChannel;

                    setTimeout(async () => {
                        dmChannel.startTyping();

                        setTimeout(async () => {
                            dmChannel.stopTyping();
                            message.author.send(response);

                            const pilkoChatEmbed = new discord.MessageEmbed()
                                .setColor(resources.gold)
                                .setAuthor(`Mensaje de: ${client.user.username}`, client.user.displayAvatarURL())
                                .setDescription(response);

                            await pilkoChatChannel.send(pilkoChatEmbed);
                        }, Math.floor(Math.random() * (8000 - 5000 + 1) + 5000));
                    }, Math.floor(Math.random() * (3000 - 2000 + 1) + 2000));
            });
        };
    };

    //FILTROS DE AUTO-MODERACIÓN
    (async () => {
        for (var key in filters) {
            await (async () => {
                if (filters[key].status) {
                    //Comprueba si el miembro tiene algún rol permitido
                    const bypassRoles = filters[key].bypassRoles;
                    const bypassChannels = filters[key].bypassChannels;

                    if (bypassChannels.includes(message.channel.id)) return;
    
                    for (let i = 0; i < bypassRoles.length; i++) {
                        if (message.member.roles.cache.has(bypassRoles[i])) return;
                    }

                    await automodFilters[key](message).then(match => {
                        if (match) require('./utils/infractionsHandler.js').run(discord, fs, config, client, resources, loggingChannel, message, message.guild, message.member, filters[key].reason, filters[key].action, client.user, message.content)
                    });
                }
            })();
        };
    })();

    //Llama al manejador de leveling
    if (!message.content.startsWith(config.prefix) && !message.content.startsWith(config.staffPrefix) && !message.content.startsWith(config.ownerPrefix) && !config.nonXPChannels.includes(message.channel.id)) return await resources.addXP(fs, config, message.member, message.guild, 'message', message.channel);

    const prefix = message.content.slice(0, 1);
    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command = cmd + `.js`;

    if (command.length <= 0) return console.error(`${new Date().toLocaleString()} 》No hubo ningún comando a cargar`);

    // Función para ejecutar el comando
    try {
        let waitEmbed = new discord.MessageEmbed().setColor(resources.red2).setDescription(`${resources.RedTick} Debes esperar 2 segundos antes de usar este comando`);
        if (talkedRecently.has(message.author.id)) return message.channel.send(waitEmbed).then(msg => {
            msg.delete({timeout: 1000})
        });

        if (prefix === config.prefix) { // EVERYONE

            //Almacena la configuración del comando
            let cfg = commandsConfig[cmd];

            //Devuelve si el comando está deshabilitado
            if (!cfg || !cfg.enabled) return;

            //Devuelve si el canal no está autorizado
            if (cfg.whitelistedChannels.length > 0 && !cfg.whitelistedChannels.includes(message.channel.id)) return;
            if (cfg.blacklistedChannels.length > 0 && cfg.whitelistedChannels.includes(message.channel.id)) return;

            //Devuelve si el rol no está autorizado
            if (cfg.whitelistedRoles.length > 0) {
                let authorized;
                for (let i = 0; i < cfg.whitelistedRoles.length; i++) {
                    if (message.member.roles.cache.find(r => r.id === cfg.whitelistedRoles[i])) {
                        authorized = true;
                        break;
                    };
                };
                if (!authorized) return;
            } else if (cfg.blacklistedRoles.length > 0) {
                for (let i = 0; i < cfg.blacklistedRoles.length; i++) {
                    if (message.member.roles.cache.find(r => r.id === cfg.blacklistedRoles[i])) {
                        return;
                    };
                };
            };

            //Ejecuta el comando
            let commandFile = require(`./commands/${command}`);
            commandFile.run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);

            //Añade un cooldown
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                talkedRecently.delete(message.author.id);
            }, 2000);
        } else if (prefix === config.staffPrefix) { // STAFF
            let commandFile = require(`./commands/staffCommands/${command}`);
            if (!commandFile) return;
            const supervisorsRole = message.guild.roles.cache.get(config.botSupervisor);
            let staffRole = message.guild.roles.cache.get(config.botStaff);

            const noPrivilegesEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} ${message.author.tag}, no dispones de privilegios suficientes para realizar esta operación`);

            if (!message.member.roles.cache.has(staffRole.id) && message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed)

            commandFile.run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed);
        } else if (prefix === config.ownerPrefix) { // OWNER
            let commandFile = require(`./commands/ownerCommands/${command}`);
            if (!commandFile) return;
            const noPrivilegesEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} ${message.author.tag}, no dispones de privilegios suficientes para ejecutar este comando`);

            if (message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed);
            commandFile.run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
        } else {
            return;
        }
    } catch (e) {
        require(`./utils/errorHandler.js`).run(discord, config, client, message, args, command, e);
    }
});

// Debugging
client.on(`error`, (e) => {
    if (e.message.includes(`ECONNRESET`)) return console.log(`${new Date().toLocaleString()} ERROR 》La conexión fue cerrada inesperadamente.\n`)
    console.error(`${new Date().toLocaleString()} 》ERROR: ${e.stack}`)
});

client.on(`warn`, error => console.warn(`${new Date().toLocaleString()} 》WARN: ${error.stack}`));
client.on('shardError', error => console.error('Una conexión websocket encontró un error:', error));
process.on('unhandledRejection', error => console.error(`${new Date().toLocaleString()} Rechazo de promesa no manejada:`, error));

// Inicio de sesión del bot
client.login(keys.token);

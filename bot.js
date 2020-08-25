'use-strict';

const logo = require('asciiart-logo');
const package = require(`./package.json`);

console.log(
    logo({
        name: `PilkoBot`,
        font: `Speed`,
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
const discord = require(`discord.js`);
const fs = require(`fs`);
const config = require(`./config.json`);
const keys = require(`./keys.json`);
const bot = new discord.Client({
    fetchAllMembers: true,
    disableEveryone: true,
    disabledEvents: [`TYPING_START`, `TYPING_STOP`],
    autoReconnect: true,
    retryLimit: Infinity 
});

//RECURSOS GLOBALES
let resources = require(`./resources/resources.js`);
const automodFilters = require('./resources/automodFilters.js')

//USUARIOS QUE USARON COMANDOS RECIENTEMENTE
const talkedRecently = new Set();

//DATOS PERSISTENTES
bot.mutes = require(`./mutes.json`);
bot.bans = require(`./bans.json`);
bot.warns = JSON.parse(fs.readFileSync(`./warns.json`, `utf-8`));

//VOZ
bot.servers = {}; //Almacena la cola y otros datos
bot.voiceStatus = true; //Almacena la disponiblidad del bot
bot.voiceDispatcher; //Almacena el dispatcher
bot.voiceConnection; //Almacena la conexión

// COMPROBACIÓN DE INICIO DE SESIÓN Y PRESENCIA
bot.on(`ready`, async () => {
    try {
        const debuggingChannel = bot.channels.cache.get(config.debuggingChannel);
        const loggingChannel = bot.channels.cache.get(config.loggingChannel);

        //Intervalo de comprobación de usuarios silenciados temporalmente
        bot.setInterval(async () => {
            for (let idKey in bot.mutes) {
                let time = bot.mutes[idKey].time;

                if (Date.now() > time) {

                    let guild = bot.guilds.cache.get(bot.mutes[idKey].guild);
                
                    let role = guild.roles.cache.find(r => r.name === `Silenciado`)
                    if (!role) continue;

                    let member;

                    try {
                        member = await guild.members.cache.get(idKey);
                    } catch (e) {
                        console.log(e);
                        delete bot.mutes[idKey];
                        fs.writeFile(`./mutes.json`, JSON.stringify(bot.mutes), async err => {
                            if (err) throw err;
    
                            let loggingEmbed = new discord.MessageEmbed()
                                .setColor(resources.green2)
                                .setAuthor(`@${bot.mutes[idKey].tag} ha sido DES-SILENCIADO, pero no se encontraba en el servidor`)
                                .addField(`ID`, idKey, true)
                                .addField(`Moderador`, `<@${bot.user.id}>`, true)
                                .addField(`Razón`, `Venció la amonestación`, true);
    
                            await loggingChannel.send(loggingEmbed);
                        });
                        return;
                    }


                    let loggingEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL())
                        .addField(`Miembro`, `<@${member.id}>`, true)
                        .addField(`Moderador`, `<@${bot.user.id}>`, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    let toDMEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`[DES-SILENCIADO]`, guild.iconURL())
                        .setDescription(`<@${member.id}>, has sido des-silenciado en ${guild.name}`)
                        .addField(`Moderador`, bot.user.id, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    await member.roles.remove(role);

                    delete bot.mutes[idKey];
                    fs.writeFile(`./mutes.json`, JSON.stringify(bot.mutes), async err => {
                        if (err) throw err;

                        await loggingChannel.send(loggingEmbed);
                        await member.send(toDMEmbed);
                    });
                }
            }
        }, 5000)

        //Intervalo de comprobación de usuarios baneados temporalmente
        bot.setInterval(async () => {
            for (let idKey in bot.bans) {
                let time = bot.bans[idKey].time;
                let guild = bot.guilds.cache.get(bot.bans[idKey].guild);
                let user = await bot.users.fetch(idKey);

                if (Date.now() > time) {
                    let loggingEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`${user.tag} ha sido DES-BANEADO`, user.displayAvatarURL())
                        .addField(`Usuario`, `@${user.tag}`, true)
                        .addField(`Moderador`, `<@${bot.user.id}>`, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    await guild.members.unban(idKey);

                    delete bot.bans[idKey];
                    fs.writeFile(`./bans.json`, JSON.stringify(bot.bans), async err => {
                        if (err) throw err;

                        await loggingChannel.send(loggingEmbed);
                    });
                }
            }
        }, 5000)

        //Intervalo de comprobación del tiempo de respuesta del Websocket
        bot.setInterval(async () => {
            let ping = Math.round(bot.ping);
            if (ping > 1000) {
                console.log(`${new Date().toLocaleString()} 》Tiempo de respuesta del Websocket elevado: ${ping} ms\n`);

                let debuggingEmbed = new discord.MessageEmbed()
                    .setColor(0xF8A41E)
                    .setTimestamp()
                    .setFooter(bot.user.username, bot.user.avatarURL())
                    .setDescription(`${resources.OrangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${ping}** ms`);
                debuggingChannel.send(debuggingEmbed);
            }
        }, 60000)

        //Presencia
        await bot.user.setPresence({
            status: config.status,
            activity: {
                name: `${bot.users.cache.filter(user => !user.bot).size} usuarios | ${config.game}`,
                type: config.type
            }
        });
        
        //Actualización de usuarios totales en presencia
        bot.setInterval(async () => {
            await bot.user.setPresence({
                activity: {
                    name: `${bot.users.cache.filter(user => !user.bot).size} usuarios | ${config.game}`,
                    type: config.type
                }
            });
        }, 60000)

        //Recursos globales
        resources.run(discord, bot);
        resources = require(`./resources/resources.js`);

        //Auditoría
        console.log(` 》${bot.user.username} iniciado correctamente \n  ● Estatus: ${config.status}\n  ● Tipo de actividad: ${config.type}\n  ● Actividad: ${config.game}\n`);

        let statusEmbed = new discord.MessageEmbed()
            .setTitle(`📑 Estado de ejecución`)
            .setColor(resources.gold)
            .setDescription(`${bot.user.username} iniciado correctamente`)
            .addField(`Estatus:`, config.status, true)
            .addField(`Tipo de actividad:`, config.type, true)
            .addField(`Actividad:`, `${bot.users.cache.filter(user => !user.bot).size} usuarios | ${config.game}`, true)
            .addField(`Usuarios:`, bot.users.cache.filter(user => !user.bot).size, true)
            .addField(`Versión:`, package.version, true)
            .setFooter(`${bot.user.username} • Este mensaje se borrará en 10s`, bot.user.avatarURL());
        debuggingChannel.send(statusEmbed).then(msg => {msg.delete({timeout: 10000})});
        debuggingChannel.send(`<@${config.botOwner}>`).then(msg => {msg.delete({timeout: 1000})});
    } catch (e) {
        console.error(`${new Date().toLocaleString()} 》${e.stack}`);
    }
});

// MANEJADOR DE EVENTOS
fs.readdir(`./events/`, async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(`.`)[0];

        if (eventName === 'guildBanAdd') {
            bot.on(eventName, (guild, user) => {
                eventFunction.run(guild, user, discord, fs, config, keys, bot, resources);
            });
        } else {
            bot.on(eventName, event => {
                eventFunction.run(event, discord, fs, config, keys, bot, resources);
            });
        }

        console.log(` - Evento [${eventName}] cargado`);
    });
    console.log(`\n`);
});

// MANEJADOR DE COMANDOS
bot.on(`message`, async message => {
    
    const debuggingChannel = bot.channels.cache.get(config.debuggingChannel);
    const loggingChannel = bot.channels.cache.get(config.loggingChannel);
    const pilkoChatChannel = bot.channels.cache.get(config.pilkoChatChannel);

    if (message.channel.id === '550420589458751526' && message.author.id !== '359333470771740683' && message.author.id !== '474051954998509571') return message.delete({timeout: 5000});

    if (message.author.bot) return;
    if (message.channel.type === `dm`) {
        if (message.author.id === `507668335547252747` || message.author.id === `468149377412890626`) {
            let prefix = message.content.slice(0, 1);
            let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
            let command = args.shift().toLowerCase();
            
            if (prefix !== `-` || command !== `ban` || !args[0]  || !args[1]) return;
            
            let member = await resources.server.fetchMember(args[0]);
            
            console.log(`${new Date().toLocaleString()} 》Se ha recibido una orden automática de baneo para ${member.user.tag} (${member.id})`);

            let spamMessage = message.content.slice(6 + args[0].length);
            
            console.log(spamMessage);
            
            let loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setAuthor(member.user.tag + ' ha sido BANEADO', member.user.displayAvatarURL())
                .addField('Miembro', '<@' + member.id + '>', true)
                .addField('Moderador', '<@468149377412890626>', true)
                .addField('Razón', `Spam vía MD`, true)
                .addField('Mensaje', spamMessage, true)
                .addField('Duración', '∞', true);
            
            await loggingChannel.send(loggingEmbed).then(resources.server.ban(member.id, {reason: `Spam vía MD`}));
            
            return;
        } else {
            console.log(`${new Date().toLocaleString()} 》DM: ${message.author.username} (ID: ${message.author.id}) > ${message.content}`);

            const noDMEmbed = new discord.MessageEmbed()
                .setColor(resources.gray)
                .setDescription(`${resources.GrayTick} | Por el momento, los comandos de **${bot.user.username}** solo está disponible desde el servidor de la **República Gamer**.`);
            
            if (message.content.startsWith(config.prefix) || message.content.startsWith(config.staffPrefix) || message.content.startsWith(config.ownerPrefix)) return await message.author.send(noDMEmbed);
            
            const pilkoChatEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setAuthor(`Mensaje de: ${message.author.tag}`, message.author.displayAvatarURL())
                .setDescription(message.content);

            return await pilkoChatChannel.send(pilkoChatEmbed);
        }
    }

    //FILTROS DE AUTO-MODERACIÓN
    (async () => {
        for (var key in config.filters) {
            await (async () => {
                if (config.filters[key].status) {
                    //Comprueba si el miembro tiene algún rol permitido
                    const bypassRoles = config.filters[key].bypassRoles;
                    const bypassChannels = config.filters[key].bypassChannels;

                    if (bypassChannels.includes(message.channel.id)) return;
    
                    for (let i = 0; i < bypassRoles.length; i++) {
                        if (message.member.roles.cache.has(bypassRoles[i])) return;
                    }

                    await automodFilters[key](message).then(match => {
                        if (match) require('./resources/infractionsHandler.js').run(discord, fs, config, bot, resources, loggingChannel, message, message.guild, message.member, config.filters[key].reason, config.filters[key].action, bot.user, message.content)
                    });
                }
            })();
        };
    })()


    if (!message.content.startsWith(config.prefix) && !message.content.startsWith(config.staffPrefix) && !message.content.startsWith(config.ownerPrefix)) return;

    const prefix = message.content.slice(0, 1);
    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase() + `.js`;

    if (command.length <= 0) return console.error(`${new Date().toLocaleString()} 》No hubo ningún comando a cargar`);

    // Función para ejecutar el comando
    try {
        let commandImput = `${new Date().toLocaleString()} 》${message.author.username} introdujo el comando: ${command.slice(-0, -3)} en el canal: ${message.channel.name} de la guild: ${message.guild.name}`;

        let waitEmbed = new discord.MessageEmbed().setColor(0xF12F49).setDescription(`${resources.RedTick} Debes esperar 2 segundos antes de usar este comando`);
        if (talkedRecently.has(message.author.id)) return message.channel.send(waitEmbed).then(msg => {
            msg.delete({timeout: 1000})
        });

        if (prefix === config.prefix) { // EVERYONE
            let commandFile = require(`./commands/${command}`);
            console.log(commandImput);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);

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
                .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

            if (!message.member.roles.cache.has(staffRole.id) && message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed)

            console.log(commandImput);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed);
        } else if (prefix === config.ownerPrefix) { // OWNER
            let commandFile = require(`./commands/ownerCommands/${command}`);
            if (!commandFile) return;
            const noPrivilegesEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para ejecutar este comando`);

            if (message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed);
            console.log(commandImput);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
        } else {
            return;
        }
    } catch (e) {
        require(`./errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
});

// Debugging
bot.on(`error`, (e) => {
    if (e.message.includes(`ECONNRESET`)) return console.log(`${new Date().toLocaleString()} ERROR 》La conexión fue cerrada inesperadamente.\n`)
    console.error(`${new Date().toLocaleString()} 》ERROR: ${e.stack}`)
});

bot.on(`warn`, (e) => console.warn(`${new Date().toLocaleString()} 》WARN: ${e.stack}`));

bot.on('shardError', error => {
    console.error('Una conexión websocket encontró un error:', error);
});

process.on('unhandledRejection', error => {
	console.error('Rechazo de promesa no manejada:', error);
});

// Inicio de sesión del bot
bot.login(keys.token);

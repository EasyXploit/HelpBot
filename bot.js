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
    .wrap(`PilkoBot es un bot multifuncional desarrollado por el Staff de la comunidad, cuyo uso es exclusivo de los usuarios de la República Gamer, por lo que no está permitido su uso fuera de los servidores administrados por la República Gamer LLC.`)
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
                let guild = bot.guilds.cache.get(bot.mutes[idKey].guild);
                let member;
                try {
                    member = await guild.fetchMember(idKey);
                } catch (e) {
                    delete bot.mutes[idKey];
                    fs.writeFile(`./mutes.json`, JSON.stringify(bot.mutes), async err => {
                        if (err) throw err;

                        let loggingEmbed = new discord.MessageEmbed()
                            .setColor(resources.green2)
                            .setAuthor(`<@${idKey}> ha sido DES-SILENCIADO, pero no se encontraba en el servidor`)
                            .addField(`ID`, idKey, true)
                            .addField(`Moderador`, `<@${bot.user.id}>`, true)
                            .addField(`Razón`, `Venció la amonestación`, true);

                        await loggingChannel.send(loggingEmbed);
                    });
                    return;
                }
                let role = guild.roles.find(r => r.name === `Silenciado`)
                if (!role) continue;

                if (Date.now() > time) {
                    let loggingEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL)
                        .addField(`Miembro`, `<@${member.id}>`, true)
                        .addField(`Moderador`, `<@${bot.user.id}>`, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    let toDMEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`[DES-SILENCIADO]`, guild.iconURL)
                        .setDescription(`<@${member.id}>, has sido des-silenciado en ${guild.name}`)
                        .addField(`Moderador`, bot.user.id, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    await member.removeRole(role);

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
                let user = await bot.fetchUser(idKey);

                if (Date.now() > time) {
                    let loggingEmbed = new discord.MessageEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`${user.tag} ha sido DES-BANEADO`, user.displayAvatarURL)
                        .addField(`Usuario`, `@${user.tag}`, true)
                        .addField(`Moderador`, `<@${bot.user.id}>`, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    await guild.unban(idKey);

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
                    .setFooter(bot.user.username, bot.user.avatarURL)
                    .setDescription(`${resources.OrangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${ping}** ms`);
                debuggingChannel.send(debuggingEmbed);
            }
        }, 60000)

        //Presencia
        await bot.user.setPresence({
            status: config.status,
            game: {
                name: `${bot.users.cache.filter(user => !user.bot).size} usuarios | ${config.game}`,
                type: config.type
            }
        });
        
        //Actualización de usuarios totales en presencia
        bot.setInterval(async () => {
            await bot.user.setPresence({
                game: {
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
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTimestamp();
        debuggingChannel.send(statusEmbed);
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

    if (message.author.bot) return;
    if (message.channel.type === `dm`) {
        if (message.author.id === `507668335547252747` || message.author.id === `468149377412890626`) {
            let prefix = message.content.slice(0, 1);
            let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
            let command = args.shift().toLowerCase();
            
            if (prefix !== `-` || command !== `ban` || !args[0]  || !args[1]) return;
            
            let member = await resources.server.fetchMember(args[0]);
            
            await console.log(`${new Date().toLocaleString()} 》Se ha recibido una orden automática de baneo para ${member.user.tag} (${member.id})`);

            let spamMessage = message.content.slice(6 + args[0].length);
            
            console.log(spamMessage);
            
            let loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setAuthor(member.user.tag + ' ha sido BANEADO', member.user.displayAvatarURL)
                .addField('Miembro', '<@' + member.id + '>', true)
                .addField('Moderador', '<@468149377412890626>', true)
                .addField('Razón', `Spam vía MD`, true)
                .addField('Mensaje', spamMessage, true)
                .addField('Duración', '∞', true);
            
            await loggingChannel.send(loggingEmbed).then(resources.server.ban(member.id, {reason: `Spam vía MD`}));
            
            return;
        } else {
            const noDMEmbed = new discord.MessageEmbed()
                .setColor(resources.gray)
                .setDescription(`${resources.GrayTick} | Por el momento, los comandos de **${bot.user.username}** solo está disponible desde el servidor de la **República Gamer**.`);
            await message.author.send(noDMEmbed);
            await console.log(`${new Date().toLocaleString()} 》DM: ${message.author.username} (ID: ${message.author.id}) > ${message.content}`);
            return;
        }
    }

    //COMPROBACIÓN DEL CONTENIDO DEL MENSAJE
    async function checkBadWords() {

        let staffRole = message.guild.roles.cache.get(config.botStaff);
        let reason;

        const swearWords = [`hijo de puta`, `me cago en tu`, `tu puta madre`, `bollera`, `chupapollas`, `concha de tu madre`, `concha tu madre`, `gilipichis`, `hija de puta`, `hijaputa`, `hijoputa`, `idiota`, `imbécil`, `imbecil`, `jilipollas`, `lameculos`, `marica`, `maricón`, `maricon`, `mariconazo`, `ramera`, `soplagaitas`, `soplapollas`, `vete a la mierda`, `tus muertos`, `tus putos muertos`, `retrasao`, `anormal`, `malparido`, `gilipollas`, `negro de mierda`, `moro de mierda`, `pancho de mierda`, `panchito de mierda`]; //Palabras prohibidas
        const invites = [`discord.gg`, `.gg/`, `.gg /`, `. gg /`, `. gg/`, `discord .gg /`, `discord.gg /`, `discord .gg/`, `discord .gg`, `discord . gg`, `discord. gg`, `discord gg`, `discordgg`, `discord gg /`] //Invitaciones prohibidas

        try {
            if (swearWords.some(word => message.content.toLowerCase().includes(word))) {
                if (message.author.id === message.guild.ownerID) return;
                await message.delete();
                reason = `Palabras ofensivas`;
            }

            if (invites.some(word => message.content.toLowerCase().includes(word))) {
                if (message.author.id === message.guild.ownerID) return;
                if (message.member.roles.cache.has(staffRole.id)) return;
                await message.delete();
                reason = `Invitaciones no permitidas`;
            }

            if (!reason) return;

            if (!bot.warns[message.author.id]) bot.warns[message.author.id] = {
                guild: message.guild.id,
                warns: 0
            }

            bot.warns[message.author.id].warns++;

            let infractionChannelEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setDescription(`${resources.OrangeTick} El usuario <@${message.author.id}> ha sido advertido debido a **${reason}**`);

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setAuthor(`${message.author.tag} ha sido ADVERTIDO`, message.author.displayAvatarURL)
                .addField(`Miembro`, `<@${message.author.id}>`, true)
                .addField(`Moderador`, `<@${bot.user.id}>`, true)
                .addField(`Razón`, reason, true)
                .addField(`Mensaje`, message.content, true);

            let toDMEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setAuthor(`[ADVERTIDO]`, message.guild.iconURL)
                .setDescription(`<@${message.author.id}>, has sido advertido en ${message.guild.name}`)
                .addField(`Moderador`, `<@${bot.user.id}>`, true)
                .addField(`Razón`, reason, true);

            fs.writeFile(`./warns.json`, JSON.stringify(bot.warns, null, 4), async err => {
                if (err) throw err;

                await message.author.send(toDMEmbed);
                await message.channel.send(infractionChannelEmbed);
                await loggingChannel.send(loggingEmbed);
            });

            //Si los warns son 3 o más
            if (bot.warns[message.author.id].warns >= 3 && bot.warns[message.author.id].warns < 5)  {
                //Comprueba si existe el rol silenciado, y de no existir, lo crea
                let role = message.guild.roles.find(r => r.name === 'Silenciado');
                if (!role) {
                    role = await message.guild.createRole({
                        name: 'Silenciado',
                        color: '#818386',
                        permissions: []
                    });
                    
                    let botMember = message.guild.members.cache.get(bot.user.id);
                    await message.guild.setRolePosition(role, botMember.highestRole.position - 1);
                    
                    message.guild.channels.forEach(async (channel, id) => {
                        await channel.overwritePermissions (role, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                            SPEAK: false
                        });
                    });
                }

                //Comprueba si este susuario ya estaba silenciado
                if (message.member.roles.cache.has(role.id)) return;

                let milliseconds = 604800000; //Duración del mute

                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(0xEF494B)
                    .setAuthor(message.member.user.tag + ' ha sido SILENCIADO', message.member.user.displayAvatarURL)
                    .addField('Miembro', '<@' + message.member.id + '>', true)
                    .addField('Moderador', '<@' + bot.user.id + '>', true)
                    .addField('Razón', 'Demasiadas infracciones', true)
                    .addField('Duración', '7 días', true);

                let toDMEmbed = new discord.MessageEmbed()
                    .setColor(0xEF494B)
                    .setAuthor('[SILENCIADO]', message.guild.iconURL)
                    .setDescription('<@' + message.member.id + '>, has sido silenciado en ' + message.guild.name)
                    .addField('Moderador', bot.user.tag, true)
                    .addField('Razón', 'Demasiadas infracciones', true)
                    .addField('Duración', '7 días', true);

                bot.mutes[message.member.id] = {
                    guild: message.guild.id,
                    time: Date.now() + milliseconds
                }
                await message.member.addRole(role);

                fs.writeFile('./mutes.json', JSON.stringify(bot.mutes, null, 4), async err => {
                    if (err) throw err;

                    await loggingChannel.send(loggingEmbed);
                    await message.member.send(toDMEmbed);
                });
            } else if (bot.warns[message.author.id].warns > 5)  {
                //Comprueba si existe el rol silenciado, y de no existir, lo crea
                let role = message.guild.roles.find(r => r.name === 'Silenciado');
                if (!role) {
                    role = await message.guild.createRole({
                        name: 'Silenciado',
                        color: '#818386',
                        permissions: []
                    });
                    
                    let botMember = message.guild.members.cache.get(bot.user.id);
                    await message.guild.setRolePosition(role, botMember.highestRole.position - 1);
                    
                    message.guild.channels.forEach(async (channel, id) => {
                        await channel.overwritePermissions (role, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false,
                            SPEAK: false
                        });
                    });
                }

                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(0xEF494B)
                    .setAuthor(message.member.user.tag + ' ha sido SILENCIADO', message.member.user.displayAvatarURL)
                    .addField('Miembro', '<@' + message.member.id + '>', true)
                    .addField('Moderador', '<@' + bot.user.id + '>', true)
                    .addField('Razón', 'Demasiadas infracciones', true)
                    .addField('Duración', '∞', true);

                let toDMEmbed = new discord.MessageEmbed()
                    .setColor(0xEF494B)
                    .setAuthor('[SILENCIADO]', message.message.guild.iconURL)
                    .setDescription('<@' + message.member.id + '>, has sido silenciado en ' + message.guild.name)
                    .addField('Moderador', bot.user.tag, true)
                    .addField('Razón', 'Demasiadas infracciones', true)
                    .addField('Duración', '∞', true);

                //Comprueba si este susuario ya estaba silenciado
                if (member.roles.has(role.id)) return;

                await message.member.addRole(role);
                await loggingChannel.send(loggingEmbed);
                await message.member.send(toDMEmbed);
            }

            return;
        } catch (e) {
            console.log(`${new Date().toLocaleString()} 》Ocurrió un error durante la ejecución de la función "checkBadWords"\nError: ${e}`);
        }
    }
    checkBadWords();

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

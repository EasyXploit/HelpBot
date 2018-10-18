'use-strict';

console.log(`》Iniciando aplicación «\n―――――――――――――――――――――――― \n${new Date().toUTCString()}\n`);

const discord = require(`discord.js`);
const fs = require(`fs`);
const config = require(`./config.json`);
const keys = require(`./keys.json`);
const package = require(`./package.json`);
const bot = new discord.Client();

let resources = require(`./resources/resources.js`);

const talkedRecently = new Set();

bot.mutes = require(`./mutes.json`);
bot.bans = require(`./bans.json`);
bot.warns = JSON.parse(fs.readFileSync(`./warns.json`, `utf-8`));
bot.giveaways = require(`./giveaways.json`);
bot.voiceStatus = true;

// COMPROBACIÓN DE INICIO DE SESIÓN Y PRESENCIA
bot.on(`ready`, async () => {
    try {
        const debuggingChannel = bot.channels.get(config.debuggingChannel);
        const loggingChannel = bot.channels.get(config.loggingChannel);

        //Intervalo de comprobación de usuarios silenciados temporalmente
        bot.setInterval(async () => {
            for (let idKey in bot.mutes) {
                let time = bot.mutes[idKey].time;
                let guild = bot.guilds.get(bot.mutes[idKey].guild);
                let member = guild.members.get(idKey);
                let role = guild.roles.find (r => r.name === `Silenciado`)
                if (!role) continue;

                if (Date.now() > time) {
                    let loggingEmbed = new discord.RichEmbed()
                        .setColor(resources.green2)
                        .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL)
                        .addField(`Miembro`, `<@${member.id}>`, true)
                        .addField(`Moderador`, `<@${bot.user.id}>`, true)
                        .addField(`Razón`, `Venció la amonestación`, true);

                    let toDMEmbed = new discord.RichEmbed()
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
                let guild = bot.guilds.get(bot.bans[idKey].guild);
                let user = await bot.fetchUser(idKey);

                if (Date.now() > time) {
                    let loggingEmbed = new discord.RichEmbed()
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
        
        //Intervalo de comprobación de sorteos (en desarrollo)
        bot.setInterval(async () => {
            try {
                for (let idKey in bot.giveaways) {
                    let guild = bot.guilds.find( g => g.id === bot.giveaways[idKey].guild);
                    let channel = guild.channels.find( c => c.id === bot.giveaways[idKey].channel);
                    let giveawayMessage;

                    try {
                        giveawayMessage = await channel.fetchMessage(idKey);
                    } catch (e) {
                        if (e.toString().includes(`Unknown Message`)) {
                            delete bot.giveaways[idKey];
                            fs.writeFile(`./giveaways.json`, JSON.stringify(bot.giveaways), async err => {
                                if (err) throw err;
                            });
                            return;
                        } else {
                            console.log(e);
                        }
                    }

                    let time = bot.giveaways[idKey].time;
                    let winners = bot.giveaways[idKey].winners;
                    let winnerType = bot.giveaways[idKey].winnerType;
                    let prize = bot.giveaways[idKey].prize;

                    if (Date.now() > time) {
                        async function drawWinners() {
                            return `En desarrollo`;
                        }
                        drawWinners();

                        let newEmbed = new discord.RichEmbed()
                            .setColor(0xB8E986)
                            .setTitle(prize)
                            .setDescription(drawWinners());

                        delete bot.giveaways[idKey];

                        fs.writeFile(`./giveaways.json`, JSON.stringify(bot.giveaways), async err => {
                            if (err) throw err;

                            await giveawayMessage.edit(newEmbed);
                        });
                    } else {
                        let newEmbed = new discord.RichEmbed()
                            .setColor(resources.green)
                            .setTitle(prize)
                            .setDescription(`¡Reacciona con :tada: para entrar!\nTiempo restante: ${Date.now() - time}`)
                            .setFooter(`${winners} ${winnerType}`);

                        await giveawayMessage.edit(newEmbed);
                    }
                }
            } catch (e) {
                console.error(`${new Date().toUTCString()} 》${e.stack}`);
            }
        }, 10000)
        
        //Intervalo de comprobación del tiempo de respuesta del Websocket
        bot.setInterval(async () => {
            let ping = Math.round(bot.ping);
            if (ping > 250) {
                console.log(`${new Date().toUTCString()} 》Tiempo de respuesta del Websocket elevado: ${ping} ms\n`);
            
            	let debuggingEmbed = new discord.RichEmbed()
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
                name: `${bot.users.filter(user => !user.bot).size} usuarios | ${config.game}`,
                type: config.type
            }
        });

        //Recursos globales
        resources.run(discord, bot);
        resources = require(`./resources/resources.js`);

        //Auditoría
        console.log(` 》${bot.user.username} iniciado correctamente \n  ● Estatus: ${config.status}\n  ● Tipo de actividad: ${config.type}\n  ● Actividad: ${config.game}\n`);

        let statusEmbed = new discord.RichEmbed()
            .setTitle(`📑 Estado de ejecución`)
            .setColor(resources.gold)
            .setDescription(`${bot.user.username} iniciado correctamente`)
            .addField('Estatus:', config.status, true)
            .addField('Tipo de actividad:', config.type, true)
            .addField('Actividad:', config.game, true)
            .addField('Versión:', package.version, true)
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTimestamp();
        debuggingChannel.send(statusEmbed);
    } catch (e) {
        console.error(`${new Date().toUTCString()} 》${e.stack}`);
    }
});

// MANEJADOR DE EVENTOS
fs.readdir(`./events/`, async (err, files) => {

    if (err) return console.error(`${new Date().toUTCString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(`.`)[0];
        console.log(` - Evento [${eventName}] cargado`);

        bot.on(eventName, event => {
            eventFunction.run(event, discord, fs, config, keys, bot, resources);
        });
    });
    console.log(`\n`);
});

// MANEJADOR DE COMANDOS
bot.on(`message`, async message => {

    const debuggingChannel = bot.channels.get(config.debuggingChannel);
    const loggingChannel = bot.channels.get(config.loggingChannel);

    if (message.author.bot) return;
    if (message.channel.type === `dm`) {
        const noDMEmbed = new discord.RichEmbed()
            .setColor(resources.gray)
            .setDescription(`${resources.GrayTick} | Por el momento, los comandos de **${bot.user.username}** solo está disponible desde el servidor de la **República Gamer**.`);
        await message.author.send(noDMEmbed);
        await console.log(`${new Date().toUTCString()} 》DM: ${message.author.username} (ID: ${message.author.id}) > ${message.content}`);
        return;
    }

    //COMPROBACIÓN DEL CONTENIDO DEL MENSAJE
    async function checkBadWords() {

        let staffRole = message.guild.roles.get(config.botStaff);
        let reason;

        const swearWords = [`hijo de puta`, `me cago en tu puta madre`, `me cago en tus muertos`, `tu puta madre`, `gilipollas`]; //Palabras prohibidas
        const invites = [`discord.gg`, `.gg/`, `.gg /`, `. gg /`, `. gg/`, `discord .gg /`, `discord.gg /`, `discord .gg/`, `discord .gg`, `discord . gg`, `discord. gg`, `discord gg`, `discordgg`, `discord gg /`] //Invitaciones prohibidas

        try {
            if (swearWords.some(word => message.content.toLowerCase().includes(word))) {
                if (message.author.id === message.guild.ownerID) return;
                await message.delete();
                reason = `Palabras ofensivas`;
            }

            if (invites.some(word => message.content.toLowerCase().includes(word))) {
                if (message.author.id === message.guild.ownerID) return;
                if (message.member.roles.has(staffRole.id)) return;
                await message.delete();
                reason = `Invitaciones no permitidas`;
            }

            if (!reason) return;
            
            if (!bot.warns[message.author.id]) bot.warns[message.author.id] = {
                guild: message.guild.id,
                warns: 0
            }

            bot.warns[message.author.id].warns++;

            let infractionChannelEmbed = new discord.RichEmbed()
                .setColor(resources.orange)
                .setDescription(`${resources.OrangeTick} El usuario <@${message.author.id}> ha sido advertido debido a **${reason}**`);

            let loggingEmbed = new discord.RichEmbed()
                .setColor(resources.orange)
                .setAuthor(`${message.author.tag} ha sido ADVERTIDO`, message.author.displayAvatarURL)
                .addField(`Miembro`, `<@${message.author.id}>`, true)
                .addField(`Moderador`, `<@${bot.user.id}>`, true)
                .addField(`Razón`, reason, true)
                .addField(`Mensaje`, message.content, true);

            let toDMEmbed = new discord.RichEmbed()
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
        } catch (e) {
            console.log(`Ocurrió un error durante la ejecución de la función "checkBadWords"\nError: ${e}`);
        }
    }
    checkBadWords();

    if (!message.content.startsWith(config.prefix) && !message.content.startsWith(config.staffPrefix) && !message.content.startsWith(config.ownerPrefix)) return;

    const prefix = message.content.slice(0, 1);
    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase() + `.js`;

    if (command.length <= 0) return console.error(`${new Date().toUTCString()} 》No hubo ningún comando a cargar`);

    // Función para ejecutar el comando
    try {
        let commandImput = `${new Date().toUTCString()} 》${message.author.username} introdujo el comando: ${command.slice(-0, -3)} en el canal ${message.channel.name} de la guild ${message.guild.name}`;

        let waitEmbed = new discord.RichEmbed().setColor(0xF12F49).setDescription(`${resources.RedTick} Debes esperar 2 segundos antes de usar este comando`);
        if (talkedRecently.has(message.author.id)) return message.channel.send(waitEmbed).then(msg => {
            msg.delete(1000)
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
            const supervisorsRole = message.guild.roles.get(config.botSupervisor);
            let staffRole = message.guild.roles.get(config.botStaff);

            const noPrivilegesEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

            if (!message.member.roles.has(staffRole.id) && message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed)
            
            console.log(commandImput);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed);
        } else if (prefix === config.ownerPrefix) { // OWNER
            let commandFile = require(`./commands/ownerCommands/${command}`);
            if (!commandFile) return;
            const noPrivilegesEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para ejecutar este comando`);

            if (message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed);
            console.log(commandImput);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
        } else {
            return;
        }
    } catch (e) {
        const handler = require(`./errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
});

// Debugging
bot.on(`error`, (e) => console.error(`${new Date().toUTCString()} 》${e.stack}`));
bot.on(`warn`, (e) => console.warn(`${new Date().toUTCString()} 》${e.stack}`));

// Inicio de sesión del bot
bot.login(keys.token);

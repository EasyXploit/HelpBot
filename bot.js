console.log('》Iniciando aplicación «\n―――――――――――――――――――――――― \n' + new Date().toUTCString() + '\n');

const discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const roles = require('./roles.json');
const keys = require('./keys.json');
const package = require('./package.json');
const bot = new discord.Client();

let emojis = require(`./resources/emojis.js`);

const talkedRecently = new Set();
bot.mutes = require('./mutes.json');

// COMPROBACIÓN DE INICIO DE SESIÓN Y PRESENCIA
bot.on('ready', async () => {
    let loggingChannel = bot.channels.get(config.loggingChannel);
    try {
        await bot.user.setPresence({status: config.status, game: {name: config.game, type: config.type}});

        emojis.run(discord, bot);
        emojis = require(`./resources/emojis.js`);
        
        console.log(' 》' + bot.user.username + ' iniciado correctamente \n  ● Estatus: ' + config.status + '\n  ● Tipo de actividad: ' + config.type + '\n  ● Actividad: ' + config.game + '\n');
        console.log('》Tiempo de respuesta del Websocket: ' + bot.ping + 'ms\n\n');
        
        let statusEmbed = new discord.RichEmbed()
            .setTitle('📑 Estado de ejecución')
            .setColor(0xFFC857)
            .setDescription(bot.user.username + ' iniciado correctamente')
            .addField('Estatus:', config.status, true)
            .addField('Tipo de actividad:', config.type, true)
            .addField('Actividad:', config.game, true)
            .addField('Versión:', package.version, true)
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTimestamp();
        loggingChannel.send(statusEmbed);
        
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e.stack);
    }
});

// MANEJADOR DE EVENTOS
fs.readdir('./events/', async (err, files) => {
    if (err) return console.error(new Date().toUTCString() + ' 》No se ha podido completar la carga de los eventos.\n' + err.stack);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        console.log(' - Evento [' + eventName + '] cargado');

        bot.on(eventName, event => {
            eventFunction.run(event, discord, fs, config, keys, bot);
        });
    });
    console.log('\n');
});

// MANEJADOR DE COMANDOS
bot.on('message', async message => {

    let debuggingChannel = bot.channels.get(config.debuggingChannel);
    let loggingChannel = bot.channels.get(config.loggingChannel);
    
    if (message.author.bot) return;
    if (message.channel.type === 'dm') {
         const noDMEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setTitle('❕ Función no disponible')
            .setDescription('Por el momento, ' + bot.user.username + ' solo está disponible en la República Gamer.');
        await message.author.send(noDMEmbed);
        await console.log('DM: ' + message.author.username + ' >' + message.content)
        return;
    }

    //COMPROBACIÓN DEL CONTENIDO DEL MENSAJE
    async function checkBadWords() {
        
        let staffRole = message.guild.roles.get(config.botStaff);
        let reason;
        
        const swearWords = ['hijo de puta', 'me cago en tu puta madre', 'me cago en tus muertos', 'tu puta madre', 'gilipollas']; //Palabras prohibidas
        const invites = ['discord.gg', '.gg/', '.gg /', '. gg /', '. gg/','discord .gg /', 'discord.gg /', 'discord .gg/','discord .gg', 'discord . gg', 'discord. gg', 'discord gg', 'discordgg', 'discord gg /'] //Invitaciones prohibidas
        
        try {
            if(swearWords.some(word => message.content.toLowerCase().includes(word)) ) {
                await message.delete();
                reason = 'Palabras ofensivas'
            }

            if(invites.some(word => message.content.toLowerCase().includes(word)) ) {
                if (message.member.roles.has(staffRole.id)) return;
                await message.delete();
                reason = 'Invitaciones no permitidas';
            }

            if (!reason) return;

            let noBadWordsEmbed = new discord.RichEmbed()
                .setColor(0xF7A71C)
                .setAuthor('[ADVERTENCIA] ' + message.author.username, message.author.displayAvatarURL)
                .addField('Usuario', '<@' + message.author.id + '>', true)
                .addField('Moderador', '<@' + bot.user.id + '>', true)
                .addField('Razón', reason, true)

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0xF7A71C)
                .setAuthor('[ADVERTENCIA] ' + message.author.username, message.author.displayAvatarURL)
                .addField('Usuario', '<@' + message.author.id + '>', true)
                .addField('Moderador', '<@' + bot.user.id + '>', true)
                .addField('Razón', reason, true)
                .addField('Canal', message.channel, true)
                .addField('Mensaje', message.content, true)

            await message.author.send(noBadWordsEmbed);
            await loggingChannel.send(loggingEmbed);
        } catch (e) {
            console.log('Ocurrió un error durante la ejecución de la función "checkBadWords"');
        }
    }
    checkBadWords();
    
    if(!message.content.startsWith(config.prefix) && !message.content.startsWith(config.staffPrefix) && !message.content.startsWith(config.supervisorsPrefix) && !message.content.startsWith(config.ownerPrefix)) return;
    
    const prefix = message.content.slice(0, 1);
    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase() + '.js';
    
    if (command.length <= 0) return console.error(new Date() + ' 》No hubo ningún comando a cargar');
    
    // Función para ejecutar el comando
    try {
        let commandImput = new Date().toUTCString() + ' 》' + message.author.username + ' introdujo el comando: ' + message.content + ' en ' + message.guild.name;
        
        let waitEmbed = new discord.RichEmbed().setColor(0xF12F49).setDescription('❌ Debes esperar 3 segundos antes de usar este comando');
        if (talkedRecently.has(message.author.id)) return message.channel.send(waitEmbed).then(msg => {msg.delete(1000)});
        
        if (prefix === config.prefix) { // EVERYONE
            let commandFile = require(`./commands/${command}`);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis);
            console.log(commandImput);
            
            talkedRecently.add(message.author.id);
            setTimeout(() => {
              talkedRecently.delete(message.author.id);
            }, 3000);
            
        } else if (prefix === config.staffPrefix) { // STAFF
            console.log('Test')
            let staffRole = message.guild.roles.get(config.botStaff);
            const noPrivilegesEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ ' + message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando');
            
            if(!message.member.roles.has(staffRole.id)) return message.channel.send(noPrivilegesEmbed)
            
            let commandFile = require(`./commands/staffCommands/${command}`);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis);
            console.log(commandImput);
        } else if (prefix === config.supervisorsPrefix) { // SUPERVISORES
            const supervisorsRole = message.guild.roles.get(config.botSupervisor);
            const noPrivilegesEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ ' + message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando');
            
            if(message.author.id == config.botOwner || message.member.roles.has(supervisorsRole.id)) {
                let commandFile = require(`./commands/supervisorsCommands/${command}`);
                commandFile.run(discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis);
                console.log(commandImput);
            } else {
                return message.channel.send(noPrivilegesEmbed)
            }
        }  else if (prefix === config.ownerPrefix) { // OWNER
            const noPrivilegesEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ ' + message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando');
            
            if (message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed);
            let commandFile = require(`./commands/ownerCommands/${command}`);
            console.log(commandImput);
            commandFile.run(discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis);
        } else {
            return;
        }
    } catch (e) {
        console.error(new Date() + ' 》' + e.stack);
    }
});

// Debugging
bot.on('error', (e) => console.error(new Date() + ' 》' + e.stack));
bot.on('warn', (e) => console.warn(new Date() + ' 》' + e.stack));

// Inicio de sesión del bot
bot.login(keys.token);

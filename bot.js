console.log("» Iniciando aplicación «\n―――――――――――――――――――――――― \n");

const discord = require("discord.js"); 
const newUsers = new discord.Collection();     //En desarrollo
const fs = require("fs");
const config = require("./config.json");
const token = require("./token.json");

const bot = new discord.Client();

// Verificación de inicio de sesión y presencia
bot.on("ready", () => {
    console.log(new Date() + " 》" + bot.user.username + " iniciado correctamente \n");

    let loggingChannel = bot.channels.get(config.loggingChannel);

    let embed = new discord.RichEmbed()
        .setTitle("📑 Estado de ejecución")
        .setColor(16762967)
        .setDescription(bot.user.username + " iniciado correctamente")
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTimestamp()
    loggingChannel.send({embed});

    bot.user.setPresence( {
        status: "online",
        game: {
            name: "!ayuda | ¡A tu servicio!",
            type: "PLAYING"
        }
    });
});

// EVENTOS

// Este loop lee la carpeta /events/ y adjunta cada evento a su archivo de evento apropiado
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(new Date() + " 》" + err);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(".")[0]; 
        console.log(" - Evento [" + eventName + "] cargado");

        // Llama a los eventos con sus propios argumentos después de la variable "bot"
        bot.on(eventName, event => {
            eventFunction.run(event, discord, fs, config, token, bot);
        });
    });
    console.log("\n");
});


// COMANDOS

// Función para comprobar si los menesajes son un comandos
bot.on("message", message => {
    if (message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    // indexOf !== buscará el prefijo desde la posición 0 [String.prototype.indexOf()]

    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Función para ejecutar el comando
    try {
        let commandFile = require(`./commands/${command}.js`);
        commandFile.run(discord, fs, config, token, bot, message, args);
    } catch (err) {
        console.log(new Date() + " 》" + message.author.username + " intentó ejecutar el comando  " + message.content + "  en  " + message.guild.name + ", pero el comando no existe, ocurrió un error en su ejecución o está siendo procesado por otra aplicación que utiliza el mismo prefijo\n");
        console.error(new Date() + " 》" + err);
    }
});

bot.on("error", (e) => console.error(new Date() + " 》" + e));
bot.on("warn", (e) => console.warn(new Date() + " 》" + e));

// Inicio de sesión del bot
bot.login(token.token);

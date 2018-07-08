console.log("» Iniciando Pilko Bot «");
console.log("――――――――――――――――――――――― \n");

const discord = require("discord.js"); 
const fs = require("fs");
const config = require("./config.json");

const bot = new discord.Client();

// Verificación de inicio de sesión y presencia
bot.on("ready", () => {
    console.log("» Pilko Bot iniciado correctamente \n");
    let channel = bot.channels.get(config.loggingChannel);
    channel.send({embed: {
            "color": 16762967,
            "title": "● Estado de ejecución:",
            "description": "Pilko Bot iniciado correctamente",
        }});

    bot.user.setPresence( {
        status: "online",
        game: {
            name: "!ayuda",
            type: "PLAYING"
        }
    });
});

// EVENTOS  [POR RAZONES DESCONOCIDAS DEJÓ DE FUNCIONAR]

// Este loop lee la carpeta /events/ y adjunta cada evento a su archivo de evento apropiado
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(".")[0]; 
        console.log(" - Evento [" + eventName + "] cargado");

        // Llama a los eventos con sus propios argumentos después de la variable "bot"
        bot.on(eventName, (...args) => {
            eventFunction.run(bot, ...args);
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
        commandFile.run(bot, message, args);
    } catch (err) {
        console.error(err);
    }
});

// Inicio de sesión del bot
bot.login(config.token);
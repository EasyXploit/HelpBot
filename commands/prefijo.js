const fs = require ("fs");
const config = require ("../config.json");

exports.run = (bot, message, args) => {
    if(message.author.id == config.botOwner) {
        if(args.length >= 1) {
            if (args.length <= 1) {
                let newPrefix = message.content.split(" ").slice(1, 2)[0];
                config.prefix = newPrefix;

                fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);

                console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
                message.channel.send ({embed: {
                    "color": 16762967,
                    "title": "Cambiaste el prefijo a `" + newPrefix + "`",
                }});
            } else {
                console.log (message.author.username + " proporcionó demasiados argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
                message.channel.send ({embed: {
                    "color": 15806281,
                    "title": message.author.username + ", tan solo debes proporcionar un prefijo",
                }});
            }
        } else {
            console.log (message.author.username + " no proporcionó suficientes argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
            message.channel.send ({embed: {
                "color": 15806281,
                "title": message.author.username + ", debes proporcionar un prefijo",
            }});
        }
    } else {
        console.log (message.author.username + " no dispone de privilegios suficientes para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
            message.channel.send ({embed: {
                "color": 15806281,
                "title": message.author.username + ", no dispones de privilegios suficientes para ejecutar este comando",
            }});
    }
}
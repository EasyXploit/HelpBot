const config = require("../config.json");

exports.run = (bot, message, args) => {
    
    let supervisorsRole = message.guild.roles.get(config.botSupervisor);
    if(message.author.id == config.botOwner) {
        message.channel.send ({embed: {
            "color": 4886754,
            "title": "● Estado de ejecución:",
            "description": "Deteniendo Pilko Bot . . .",
        }});
        bot.destroy();
        console.log("» Deteniendo Pilko Bot");
    } else if (message.member.roles.has(supervisorsRole.id)){
        message.channel.send ({embed: {
            "color": 4886754,
            "title": "● Estado de ejecución:",
            "description": "Deteniendo Pilko Bot . . .",
        }});
        bot.destroy();
        console.log("» Deteniendo Pilko Bot");
    } else {
        console.log (message.author.username + " no dispone de privilegios suficientes para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
        message.channel.send ({embed: {
            "color": 15806281,
            "title": message.author.username + ", no dispones de privilegios suficientes para ejecutar este comando",
        }});
    };
};
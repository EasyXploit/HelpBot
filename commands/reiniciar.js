const config = require("../config.json");

exports.run = (bot, message, args) => {
    
    let staffRole = message.guild.roles.get(config.botStaff);
    if(message.member.roles.has(staffRole.id)) {
        message.channel.send ({embed: {
            "color": 4886754,
            "title": "● Estado de ejecución:",
            "description": "Reiniciando Pilko Bot . . .",
        }});

        // Destrucción de la actividad
        bot.destroy();
        console.log("» Deteniendo Pilko Bot");

        // Inicio de sesión del bot
        bot.login(config.token);
        console.log("» Iniciando Pilko Bot");
    } else {
        console.log (message.author.username + " no dispone de privilegios suficientes para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
        message.channel.send ({embed: {
            "color": 15806281,
            "title": message.author.username + ", no dispones de privilegios suficientes para ejecutar este comando",
        }});
    };
};
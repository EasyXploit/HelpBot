const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "title": "Sistema de ayuda",
        "color": 16762967,
        "description": "Obtén ayuda con los siguientes comandos:",

        "author": {
            "name": "Pilko Bot",
            "url": "https://discord.gg/j4y9xcY",
            "icon_url": bot.user.avatarURL,
        },

        "fields": [
          {
            "name": ":grey_question: !normas",
            "value": "Muestra las normas del servidor.",
            "inline": true,
          },
          {
            "name": ":robot: !comandos",
            "value": "Muestra los comandos de los bots.",
            "inline": true,
          },
          {
            "name": ":medal: !rank",
            "value": "Muestra tu rango en el servidor (o el de otro usuario).",
            "inline": true,
          },
          {
            "name": ":trophy: !levels",
            "value": "Muestra la tabla de clasificación del servidor.",
            "inline": true,
          },
          {
            "name": ":warning: !reportar",
            "value": "Informa de cualquier tipo de irregularidad al @STAFF.",
            "inline": true,
          },
          {
            "name": ":stopwatch: !ping",
            "value": "Comprueba el tiempo de respuesta entre el cliente y el bot",
            "inline": true,
          },
        ],
        footer: {
            icon_url: bot.user.avatarURL,
            text: "© 2018 República Gamer",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
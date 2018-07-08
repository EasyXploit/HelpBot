const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "title": "Comandos para bots",
        "color": 16762967,
        "description": "Aquí tienes los comandos de ayuda para usar a los bots. Recuerda escribirlos en el canal de texto correspondiente:",

        "author": {
            "name": "Pilko Bot",
            "url": "https://discord.gg/j4y9xcY",
            "icon_url": bot.user.avatarURL,
        },

        "fields": [
          {
            "name": ":zap: !salas",
            "value": "Muestra la ayuda para crear salas personalizadas.",
            "inline": true,
          },
          {
            "name": ":ticket: !tickets",
            "value": "Muestra la ayuda para el sistema de tickets de soporte.",
            "inline": true,
          },
          {
            "name": ":musical_note: !musica",
            "value": "Muestra la ayuda para reproducir música en las salas de voz.",
            "inline": true,
          },
          {
            "name": "🎶 !dj",
            "value": "Muestra los comandos para controlar la música (solo DJs).",
            "inline": true,
          },
          {
            "name": ":fire: !tatsumaki",
            "value": "Muestra la ayuda para @Tatsumaki.",
            "inline": true,
          },
          {
            "name": ":performing_arts: !memes",
            "value": "Muestra la ayuda para enviar memes y efectos sonoros.",
            "inline": true,
          },
          {
            "name": ":first_place: !rank",
            "value": "Muestra tu rango en el servidor.",
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
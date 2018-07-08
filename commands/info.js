const discord = require ("discord.js"); 
const config = require ("../config.json");
        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "title": "Propiedad de la República Gamer",
        "description": "Pilko Bot es un bot para uso exclusivo de los usuarios de la República Gamer",
        "url": "https://discord.gg/j4y9xcY",
        "color": 16762967,
        "timestamp": new Date(),
        "footer": {
          "icon_url": bot.user.avatarURL,
          "text": "©2018 República Gamer"
        },

        "fields": [
          {
            "name": ":link: Únete al servidor:",
            "value": config.serverInvite,
            "inline": true,
          },
        ],
        
        "author": {
          "name": "Pilko Bot",
          "url": "https://discord.gg/j4y9xcY",
          "icon_url": bot.user.avatarURL,
        },
        }
    }).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
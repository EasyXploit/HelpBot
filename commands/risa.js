const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "color": 16762967,
        "description": "**¡HERMANO, QUE ME DA LA PUTA RISA!**",

        "author": {
          "name": "El Pilko",
          "icon_url": "https://cdn.discordapp.com/avatars/223945607662927872/1b2170a1d14e3d46d97254e999a98431.png?",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
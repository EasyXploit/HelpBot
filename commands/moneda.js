
const config = require ("../config.json");

var datos = ["CARA", "CRUZ"];

exports.run = (bot, message, args) => {

    const coin = bot.emojis.find("name", "coin");
    
    message.channel.send ({embed: {
        "color": 16312092,
        "title": "Lanzaste una moneda ...  " + coin,
        "description": "¡Salió `" + datos[Math.floor(Math.random() * datos.length)] + "`!",

    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
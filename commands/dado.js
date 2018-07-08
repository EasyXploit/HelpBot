const config = require ("../config.json");

var datos = ["1", "2", "3", "4", "5", "6"];

exports.run = (bot, message, args) => {
    
    message.channel.send ({embed: {
        "color": 10197915,
        "title": "Lanzaste un dado ...  🎲",
        "description": "¡Salió `" + datos[Math.floor(Math.random() * datos.length)] + "`!",

    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
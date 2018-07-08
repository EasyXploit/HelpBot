const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "color": 16762967,
        "title": "Tiempo de respuesta: ",
        "description": new Date().getTime() - message.createdTimestamp + " ms :stopwatch:",
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
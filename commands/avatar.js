const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    let user = message.mentions.users.first() || message.author;

        message.channel.send ({embed: {
            "color": 16762967,
            "title": "URL del Avatar",
            "url": user.avatarURL,

            "image": {
                "url": user.avatarURL,
            },
            "author": {
                "name": "Avatar de @" + user.username,
            },
        }}).catch(console.error);
        console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
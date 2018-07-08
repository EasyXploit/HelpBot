const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "color": 16762967,
        "description": ":speech_balloon:  **__Akinator:__ adivina en que persona estás pensando:** \n \n • `start`   _empieza una partida._ \n • `stop`   _para la partida empezada._ \n • `user [@usuario]`   _muestra info. sobre un usuario._ \n • `guild [id de servidor]`   _muestra info. sobre un servidor._ \n • `ladder [global]`   _muestra la leaderboard de un servidor._ \n \n Estos comandos sólo pueden ser utilizados en el canal de texto #akinator",

        footer: {
            icon_url: bot.user.avatarURL,
            text: "© 2018 República Gamer",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
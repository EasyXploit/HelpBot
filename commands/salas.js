const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "color": 16762967,
        "description": "⚡  __**Puedes crear tus propias salas con los siguientes comandos:**__ \n \n • `/create`   _crea una sala privada con tu nombre_ \n • `/revoke`   _elimina tu sala_ \n • `/lock`   _convierte tu sala en privada_ \n • `/unlock`   _convierte tu sala en pública_ \n • `/add [@usuario]`   _permite a un usuario entrar a tu sala_ \n • `/remove [@usuario]`   _impide a un usuario entrar a tu sala_ \n • `/name [texto]`   _renombra tu sala_ \n \n • `/whitelist add [@usuario]`   _para añadir a un usuario a la lista blanca_ \n • `/whitelist remove [@usuario]`  _para quitar a un usuario de tu lista blanca_ \n • `/whitelist clear`   _para eliminar a todo el mundo de la lista blanca_ \n \n Estos comandos sólo pueden ser utilizados en el canal de texto #comandos",

        footer: {
            icon_url: bot.user.avatarURL,
            text: "© 2018 República Gamer",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
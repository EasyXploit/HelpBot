const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "color": 16762967,
        "description": ":musical_note:  __**Puedes reproducir música con los siguientes comandos:**__ \n \n **Básicos:** :musical_score: \n • `>play [canción]`  _reproduce una canción_ \n • `>skip`  _omite la canción actual_ \n • `>pause`  _pausa la cola_ \n • `>clear`  _borra la cola de reproducción_ \n • `>join`  _mueve el bot al canal de voz actual_ \n • `>leave`  _desconecta el bot del canal de voz actual_ \n • `>queue`  _muestra la cola_ \n \n **Avanzados:** :notes: \n • `>loop`  _reproduce en bucle la canción actual_ \n • `>loopqueue`  _reproduce en bucle toda la cola_ \n • `>lyrics`  _muestra la letra de la canción actual_ \n • `>np`  _muestra la canción actual_ \n • `>seek [momento (00:00)]` _busca un momento exacto de la canción_ \n • `>shuffle`  _reproduce aleatoriamente_ \n • `>soundcloud`  _busca en SoundCloud_ \n \n • `>aliases`  _para ver el resto de comandos_",

        footer: {
            icon_url: bot.user.avatarURL,
            text: "© 2018 República Gamer",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
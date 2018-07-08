const config = require ("../config.json");    
    
exports.run = (bot, message, args) => {
    
    message.channel.send ({embed: {
        "color": 16762967,
        "description": ":performing_arts:  __**Puedes enviar memes y efectos sonoros con los siguientes comandos**__ \n (utiliza el prefijo `pls`): \n \n ●  `agree`, `asktrump`, `boo`, `call`, `dankrate`, `fart`, `greentext`, `henlo`, `joke`, `justright`, `kill`, `meme`, `memegen`, `mock`, `pupper`, `kitty`, `pun`, `porn`, `say`, `shitpost`, `spin` \n \n ●  `ban`, `batslap`, `brazzers`, `byemom`, `cancer`, `dank`, `delete`, `hitler`, `invert`, `jail`, `magik`, `pride`, `rip`, `salty`, `search`, `shit`, `spank`, `trigger`, `warp`",

        footer: {
            icon_url: bot.user.avatarURL,
            text: "© 2018 República Gamer",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}
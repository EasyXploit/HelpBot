exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let embed = new discord.RichEmbed()
        .setAuthor("AYUDA", "http://i.imgur.com/sYyH2IM.png")
        .setTitle("Memes y efectos sonoros :performing_arts:")

        .setColor(16762967)
        .setDescription("Recuerda utilizar el prefijo `pls`\n \n ●  `agree`, `asktrump`, `boo`, `call`, `dankrate`, `fart`, `greentext`, `henlo`, `joke`, `justright`, `kill`, `meme`, `memegen`, `mock`, `pupper`, `kitty`, `pun`, `porn`, `say`, `shitpost`, `spin` \n \n ●  `ban`, `batslap`, `brazzers`, `byemom`, `cancer`, `dank`, `delete`, `hitler`, `invert`, `jail`, `magik`, `pride`, `rip`, `salty`, `search`, `shit`, `spank`, `trigger`, `warp`")
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
    message.channel.send({embed})

    .catch ((err) => {
        console.error(new Date() + " 》" + err);

        let embed = new discord.RichEmbed()
            .setColor(15806281)
            .setTitle("❌ Ocurrió un error")
            .setDescription("Ocurrió un error durante la ejecución del comando")
        message.channel.send({embed})
    })
}

exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    let successEmbed = new discord.RichEmbed()
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Memes y efectos sonoros :performing_arts:')
        .setColor(0xFFC857)
        .setDescription('Recuerda utilizar el prefijo `pls`\n \n ●  `agree`, `asktrump`, `boo`, `call`, `dankrate`, `fart`, `greentext`, `henlo`, `joke`, `justright`, `kill`, `meme`, `memegen`, `mock`, `pupper`, `kitty`, `pun`, `porn`, `say`, `shitpost`, `spin` \n \n ●  `ban`, `batslap`, `brazzers`, `byemom`, `cancer`, `dank`, `delete`, `hitler`, `invert`, `jail`, `magik`, `pride`, `rip`, `salty`, `search`, `shit`, `spank`, `trigger`, `warp`')
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL);
    message.channel.send(successEmbed);
}

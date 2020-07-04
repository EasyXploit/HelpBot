exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!memes
    
    try {
        let helpEmbed = new discord.MessageEmbed ()
            .setColor(0xFFC857)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle('Memes y efectos sonoros :performing_arts:')
            .setDescription('Recuerda utilizar el prefijo `pls`\n \n ●  `agree`, `asktrump`, `boo`, `call`, `dankrate`, `fart`, `greentext`, `henlo`, `joke`, `justright`, `kill`, `meme`, `memegen`, `mock`, `pupper`, `kitty`, `pun`, `porn`, `say`, `shitpost`, `spin` \n \n ●  `ban`, `batslap`, `brazzers`, `byemom`, `cancer`, `dank`, `delete`, `hitler`, `invert`, `jail`, `magik`, `pride`, `rip`, `salty`, `search`, `shit`, `spank`, `trigger`, `warp`')
            .setFooter('© 2020 República Gamer S.L.', resources.server.iconURL());
        message.channel.send(helpEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

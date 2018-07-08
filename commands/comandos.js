exports.run = (discord, fs, config, token, bot, message, args) => {

    const pokeball = bot.emojis.find("name", "pokeball");   
    
    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name)

    let embed = new discord.RichEmbed()
        .setAuthor("COMANDOS", "http://i.imgur.com/E3nPnZY.png")
        .setTitle("Comandos de los bots del servidor")

        .setColor(16762967)
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
        .setThumbnail("http://i.imgur.com/g31RYSS.png")
        
        .addField(':robot: !pilko', 'Muestra los comandos de <@446041159853408257> ', true)
        .addField(':zap: !salas', 'Muestra la ayuda para crear salas personalizadas.', true)
        .addField(':musical_note: !musica', 'Muestra la ayuda para reproducir música en las salas de voz.', true)
        .addField('🎶 !dj', 'Muestra los comandos para controlar la música (solo DJs).', true)
        .addField(':fire: !tatsumaki', 'Muestra la ayuda para <@172002275412279296>.', true)
        .addField(':performing_arts: !memes', 'Muestra la ayuda para enviar memes y efectos sonoros.', true)
        .addField(':package: !boxbot', 'Muestra la ayuda para jugar a <@413728456942288896> en <#433376010688397312> y <#435495241840328705>', true)
        .addField(pokeball + ' !pokecord', 'Muestra la ayuda para <@365975655608745985> en <#433376047833022513> ', true)

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

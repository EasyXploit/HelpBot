exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let embed = new discord.RichEmbed()
      .setTitle("Propiedad de la República Gamer")
      .setAuthor(bot.user.username, bot.user.avatarURL)

      .setColor(16762967)
      .setDescription("**" + bot.user.username + "** es un bot multifuncional desarrollado por el Staff de la comunidad, cuyo uso es exclusivo de los usuarios de la **República Gamer**, por lo que no está permitido su uso fuera de los servidores administrador por la **República Gamer LLC**.\n\n_Para más información relativa a las funcionalidades de este bot, escribe `!ayuda`_")
      .setFooter("©2018 República Gamer LLC", bot.user.avatarURL)
      .setThumbnail("https://i.imgur.com/cTW63kf.png")

      .setURL("https://discord.gg/j4y9xcY")
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

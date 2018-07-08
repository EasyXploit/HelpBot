exports.run = (discord, fs, config, token, bot, message, args) => {

    const coin = bot.emojis.find("name", "coin");

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let embed = new discord.RichEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription("Comandos de " + bot.user.username)

        .setColor(16762967)
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
        .setThumbnail("https://i.imgur.com/cTW63kf.png")

        .addField("Comandos sociales", "👦  **" + config.prefix + "avatar** _muestra tu avatar o el de cualquier usuario._\n🐈  **" + config.prefix + "catfacts** _muestra un dato curioso sobre los gatos._\n🐕  **" + config.prefix + "dogfacts** _muestra un dato curioso sobre los perros._\n:game_die:  **" + config.prefix + "dado** _lanzará un dado._\n" + coin + "  **" + config.prefix + "moneda** _lanzará una moneda._\n💭  **" + config.prefix + "di** _hará que " + bot.user.username + " repita lo que escribas._", true)
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

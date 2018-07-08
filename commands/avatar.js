exports.run = (discord, fs, config, token, bot, message, args) => {
    
    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let user = message.mentions.users.first() || message.author;

        const embed = new discord.RichEmbed()
            .setTitle("URL del Avatar")
            .setAuthor("Avatar de @" + user.username)
            .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)

            .setColor(16762967)
            .setImage(user.avatarURL)
            .setURL(user.avatarURL)
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

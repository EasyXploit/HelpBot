exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    const coin = bot.emojis.find("name", "coin");
    const datos = ["CARA", "CRUZ"];
    
    const embed = new discord.RichEmbed()
        .setTitle("Lanzaste una moneda ...  " + coin)

        .setColor(16312092)
        .setDescription("¡Salió __**" + datos[Math.floor(Math.random() * datos.length)] + "**__!")
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

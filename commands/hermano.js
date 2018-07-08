exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    message.delete();

    let embed = new discord.RichEmbed()
        .setColor(16762967)
        .setAuthor("El Pilko", "https://cdn.discordapp.com/avatars/223945607662927872/1b2170a1d14e3d46d97254e999a98431.png?")
        .setTitle("¡HERMANO, QUE ME DA LA PUTA RISA!")
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

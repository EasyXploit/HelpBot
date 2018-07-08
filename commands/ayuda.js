exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let embed = new discord.RichEmbed()
        .setAuthor("AYUDA", "http://i.imgur.com/sYyH2IM.png")
        .setTitle("Sistema de ayuda del servidor")

        .setColor(16762967)
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
        .setThumbnail("http://i.imgur.com/sYyH2IM.png")

        .addField(":grey_question: !normas", "Muestra las normas del servidor.", true)
        .addField(":robot: !comandos", "Muestra los comandos de los bots.", true)
        .addField(":medal: !rank", "Muestra tu rango en el servidor (o el de otro usuario).", true)
        .addField(":trophy: !levels", "Muestra la tabla de clasificación del servidor.", true)
        .addField(':warning: !reportar', 'Informa de cualquier tipo de irregularidad al @STAFF.', true)
        .addField(':stopwatch: !ping', 'Comprueba el tiempo de respuesta entre el cliente y el bot', true)
        .addField('🔰 !staff', 'Muestra la lista de comandos administrativos', true)
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

exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let embed = new discord.RichEmbed()
        .setAuthor("AYUDA", "http://i.imgur.com/sYyH2IM.png")
        .setTitle("Creación de salas automáticas ⚡")

        .setColor(16762967)
        .setDescription("• `/create`   _crea una sala privada con tu nombre_ \n• `/revoke`   _elimina tu sala_ \n• `/lock`   _convierte tu sala en privada_ \n• `/unlock`   _convierte tu sala en pública_ \n• `/add [@usuario]`   _permite a un usuario entrar a tu sala_ \n• `/remove [@usuario]`   _impide a un usuario entrar a tu sala_ \n• `/name [texto]`   _renombra tu sala_ \n \n• `/whitelist add [@usuario]`   _añade a un usuario a tu lista blanca_ \n• `/whitelist remove [@usuario]`  _quita a un usuario de tu lista blanca_ \n• `/whitelist clear`   _elimina a todo el mundo de tu lista blanca_ \n \n**Recuerda que estos comandos sólo pueden ser utilizados en el canal de texto <#388699973866225676>**")
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

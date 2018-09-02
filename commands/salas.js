exports.run = (discord, fs, config, token, bot, message, args, command) => {

    let successEmbed = new discord.RichEmbed()
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Creación de salas automáticas ⚡')

        .setColor(0xFFC857)
        .setDescription('Estos comandos permiten crear tu propio **canal de voz temporal** y decidir __quien puede o no puede entrar__.\n_Recuerda que no está permitida la reproducción de música en una sala de juego, si no es con el consentimiento de los que están jugando._\n\n• `/create`   _crea una sala privada con tu nombre_ \n• `/revoke`   _elimina tu sala_ \n• `/lock`   _convierte tu sala en privada_ \n• `/unlock`   _convierte tu sala en pública_ \n• `/add [@usuario]`   _permite a un usuario entrar a tu sala_ \n• `/remove [@usuario]`   _impide a un usuario entrar a tu sala_ \n• `/name [texto]`   _renombra tu sala_ \n \n• `/whitelist add [@usuario]`   _añade a un usuario a tu lista blanca_ \n• `/whitelist remove [@usuario]`  _quita a un usuario de tu lista blanca_ \n• `/whitelist clear`   _elimina a todo el mundo de tu lista blanca_ \n \n**Recuerda que estos comandos sólo pueden ser utilizados en el canal de texto <#388699973866225676>**')
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL);
    message.channel.send(successEmbed);
}

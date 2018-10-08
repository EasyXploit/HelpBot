exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!salas
    
    try {
        let helpEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle('Creación de salas automáticas ⚡')
            .setDescription('Estos comandos permiten crear tu propio **canal de voz temporal** y decidir __quien puede o no puede entrar__.\n\n**Los comandos sólo pueden ser utilizados en el canal de texto <#388699973866225676>**\n\n• `/create` _crea una sala privada con tu nombre_\n• `/revoke`_elimina tu sala_\n• `/room lock` _convierte tu sala en privada_\n• `/room unlock` _convierte tu sala en pública_\n• `/room add [@usuario]` _permite a un usuario entrar a tu sala_\n• `/room remove [@usuario]` _impide a un usuario entrar a tu sala_\n• `/room block [@usuario]` _bloquea a un usuario de tu sala_\n• `/room set name [texto]` _renombra tu sala_\n• `/roome set memberlimit [número]` _cambia el límite de usuarios de la sala_\n\n~~• `/whitelist remove [@usuario]` _quita a un usuario de tu lista blanca_\n• `/whitelist clear` _elimina a todo el mundo de tu lista blanca_~~\n\n_Recuerda que no está permitida la reproducción de música en una sala de juego, si no es con el consentimiento de los que están jugando._')
            .setFooter('© 2018 República Gamer LLC', resources.server.iconURL);
        message.channel.send(helpEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

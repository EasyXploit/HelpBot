exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-staff
    
    try {
        message.delete();
        
        let successEmbed = new discord.MessageEmbed ()
            .setColor(0xB8E986)
            .setDescription(`${resources.GreenTick} ¡Te he enviado los detalles por Mensaje Directo!`);

        let helpEmbed = new discord.MessageEmbed ()
            .setColor(0x2BBDC4)
            .setThumbnail('https://i.imgur.com/iODevD9.png')
            .setAuthor('STAFF', 'https://i.imgur.com/iODevD9.png')
            .setTitle('Comandos para el Staff del servidor')
            .addField(`🔄 ${config.staffPrefix}restart`, 'Reinicia a ' + bot.user.username, true)
            .addField(`:stop_button: ${config.staffPrefix}stop`, `Detiene a ${bot.user.username} ${resources.shield}`, true)
            .addField(`🙍 ${config.staffPrefix}userinfo (@usuario | id | nada)`, 'Muestra información acerca del usuario mencionado', true)
            .addField(`🖥 ${config.staffPrefix}serverinfo`, 'Muestra información acerca de la guild actual', true)
            .addField(`🔖 ${config.staffPrefix}roleinfo (@rol | rol | id)`, 'Muestra información acerca de un rol', true)
            .addField(`${resources.OrangeTick} ${config.staffPrefix}warn (@miembro | id) (razón)`, 'Advierte a un usuario', true)
            .addField(`📤 ${config.staffPrefix}rmwarn (@miembro | id) (cantidad) (razón)`, `Retira una determinada cantidad de advertencias a un usuario${resources.shield}`, true)
            .addField(`🔇 ${config.staffPrefix}mute (@usuario | id) (motivo)`, `Silencia a un usuario${resources.shield}`, true)
            .addField(`🔈 ${config.staffPrefix}tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)`, 'Silencia a un usuario de forma temporal', true)
            .addField(`🔊 ${config.staffPrefix}unmute (@usuario | id) (motivo)`, `Des-silencia a un usuario${resources.shield}`, true)
            .addField(`⛔ ${config.staffPrefix}kick (@usuario | id)) (motivo)`, `Expulsa a un usuario${resources.shield}`, true)
            .addField(`:hammer: ${config.staffPrefix}ban (@usuario | id) (motivo)`, `Banea a un usuario${resources.shield}`, true)
            .addField(`🕑 ${config.staffPrefix}tempban (@usuario | id) (xS | xM | xH | xD) (motivo)`, `Banea a un usuario de forma temporal${resources.shield}`, true)
            .addField(`🛡 ${config.staffPrefix}softban (@usuario | id) (motivo)`, `Banea a un usuario y borra sus mensajes (máx 14 días)${resources.shield}`, true)
            .addField(`${resources.GreenTick} ${config.staffPrefix}unban (id) (motivo)`, `Desbanea a un usuario${resources.shield}`, true)
            .addField(`🔖 ${config.staffPrefix}addrole (@rol | "rol" | id) (@usuario | id)`, 'Añade un determinado rol a un determinado usuario', true)
            .addField(`🔖 ${config.staffPrefix}removerole (@rol | "rol" | id) (@usuario | id)`, 'Retira un determinado rol a un determinado usuario', true)
            .addField(`${resources.mee6} ${config.staffPrefix}mee6`, 'Muestra las herramientas de moderación que proporciona <@159985870458322944>', true)
            .addField(`💭 ${config.staffPrefix}send (mensaje)`, `Envía un mensaje desde ${bot.user.username}`, true)
            .addField(`📬 ${config.staffPrefix}dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)`, 'Envio de mensajes directos', true)
            .addField(`📊 ${config.staffPrefix}poll "título" "campo1" "campo2" ...`, 'Envia una encuesta al canal actual', true)
            .addField(`👁 ${config.staffPrefix}register (#canal) (xS/xM/xH)`, `Hará que ${bot.user.username} registre los mensajes enviados durante el tiempo especificado.`)
            .setFooter('© 2020 República Gamer S.L. | Escudo: Solo para Supervisores', message.guild.iconURL());
        
        message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        message.author.send(helpEmbed);
    } catch (e) {
        require('../../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}

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
            .addField(`🔄 ${config.staffPrefix}restart`, 'Reinicia a ' + bot.user.username)
            .addField(`:stop_button: ${config.staffPrefix}stop`, `Detiene a ${bot.user.username} ${resources.shield}`)
            .addField(`🙍 ${config.staffPrefix}userinfo (@usuario | id | nada)`, 'Muestra información acerca del usuario mencionado')
            .addField(`🖥 ${config.staffPrefix}serverinfo`, 'Muestra información acerca de la guild actual')
            .addField(`🔖 ${config.staffPrefix}roleinfo (@rol | rol | id)`, 'Muestra información acerca de un rol')
            .addField(`${resources.OrangeTick} ${config.staffPrefix}warn (@miembro | id) (razón)`, 'Advierte a un usuario')
            .addField(`📑 ${config.staffPrefix}infractions (@miembro | id | nada)`, `Visualiza las infracciones de un usuario`)
            .addField(`📤 ${config.staffPrefix}rmwarn (@miembro | id) (id de sanción | all) (razón)`, `Retira una advertencia a un usuario`)
            .addField(`🔇 ${config.staffPrefix}mute (@usuario | id) (motivo)`, `Silencia a un usuario${resources.shield}`)
            .addField(`🔈 ${config.staffPrefix}tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)`, 'Silencia a un usuario de forma temporal')
            .addField(`🔊 ${config.staffPrefix}unmute (@usuario | id) (motivo)`, `Des-silencia a un usuario${resources.shield}`)
            .addField(`⛔ ${config.staffPrefix}kick (@usuario | id)) (motivo)`, `Expulsa a un usuario${resources.shield}`)
            .addField(`:hammer: ${config.staffPrefix}ban (@usuario | id) (motivo)`, `Banea a un usuario${resources.shield}`)
            .addField(`🕑 ${config.staffPrefix}tempban (@usuario | id) (xS | xM | xH | xD) (motivo)`, `Banea a un usuario de forma temporal${resources.shield}`)
            .addField(`🛡 ${config.staffPrefix}softban (@usuario | id) (motivo)`, `Banea a un usuario y borra sus mensajes (máx 14 días)${resources.shield}`)
            .addField(`${resources.GreenTick} ${config.staffPrefix}unban (id) (motivo)`, `Desbanea a un usuario${resources.shield}`)
            .addField(`⏱ ${config.staffPrefix}slowmode (off | segundos [5-30]) (razón)`, `Activa el modo lento en un canal`)
            .addField(`🔖 ${config.staffPrefix}addrole (@rol | "rol" | id) (@usuario | id)`, 'Añade un determinado rol a un determinado usuario')
            .addField(`🔖 ${config.staffPrefix}removerole (@rol | "rol" | id) (@usuario | id)`, 'Retira un determinado rol a un determinado usuario')
            .addField(`💭 ${config.staffPrefix}send (mensaje)`, `Envía un mensaje desde ${bot.user.username}`)
            .addField(`📬 ${config.staffPrefix}dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)`, 'Envio de mensajes directos')
            .addField(`📊 ${config.staffPrefix}poll "título" "campo1" "campo2" ...`, 'Envia una encuesta al canal actual')
            .addField(`👁 ${config.staffPrefix}register (#canal) (xS/xM/xH)`, `Hará que ${bot.user.username} registre los mensajes enviados durante el tiempo especificado.`)
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L. | Escudo: Solo para Supervisores`, message.guild.iconURL());
        
        message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        message.author.send(helpEmbed);
    } catch (e) {
        require('../../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}

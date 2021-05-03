exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-staff
    
    try {
        message.delete();
        
        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setDescription(`${resources.GreenTick} ¡Te he enviado los detalles por Mensaje Directo!`);

        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setThumbnail('https://i.imgur.com/iODevD9.png')
            .setAuthor('STAFF', 'https://i.imgur.com/iODevD9.png')
            .setTitle('Comandos para el Staff del servidor')
            .addField(`🔄 ${config.staffPrefix}restart`, `Reinicia a ${client.user.username}.`)
            .addField(`:stop_button: ${config.staffPrefix}stop`, `Detiene a ${client.user.username} ${resources.shield}`)
            .addField(`🙍 ${config.staffPrefix}userinfo (@usuario | id | nada)`, 'Muestra información acerca del usuario mencionado')
            .addField(`🖥 ${config.staffPrefix}serverinfo`, 'Muestra información acerca de la guild actual')
            .addField(`🔖 ${config.staffPrefix}roleinfo (@rol | rol | id)`, 'Muestra información acerca de un rol')
            .addField(`${resources.OrangeTick} ${config.staffPrefix}warn (@miembro | id) (razón)`, 'Advierte a un usuario')
            .addField(`📑 ${config.staffPrefix}infractions (@miembro | id | nada)`, `Visualiza las infracciones de un usuario`)
            .addField(`📤 ${config.staffPrefix}rmwarn (@miembro | id) (id de advertencia | all) (razón)`, `Retira una advertencia a un usuario`)
            .addField(`🔇 ${config.staffPrefix}mute (@usuario | id) (motivo)`, `Silencia a un miembro${resources.shield}`)
            .addField(`🔈 ${config.staffPrefix}tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)`, 'Silencia a un usuario de forma temporal')
            .addField(`🔊 ${config.staffPrefix}unmute (@usuario | id) (motivo)`, `Des-silencia a un miembro${resources.shield}`)
            .addField(`⛔ ${config.staffPrefix}kick (@usuario | id)) (motivo)`, `Expulsa a un miembro${resources.shield}`)
            .addField(`:hammer: ${config.staffPrefix}ban (@usuario | id) (motivo)`, `Banea a un usuario${resources.shield}`)
            .addField(`🕑 ${config.staffPrefix}tempban (@usuario | id) (xS | xM | xH | xD) (motivo)`, `Banea a un usuario de forma temporal${resources.shield}`)
            .addField(`🛡 ${config.staffPrefix}softban (@usuario | id) (1 - 7) (motivo)`, `Banea a un usuario y borra sus mensajes (máx 7 días)${resources.shield}`)
            .addField(`${resources.GreenTick} ${config.staffPrefix}unban (id) (motivo)`, `Desbanea a un usuario${resources.shield}`)
            .addField(`⏱ ${config.staffPrefix}slowmode (off | segundos [5-30]) (razón)`, `Activa el modo lento en un canal`)
            .addField(`💭 ${config.staffPrefix}send (mensaje)`, `Envía un mensaje desde ${client.user.username}`)
            .addField(`📬 ${config.staffPrefix}dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)`, 'Envio de mensajes directos')
            .addField(`📊 ${config.staffPrefix}poll (nada | new | end) [id]`, 'Envia una encuesta al canal actual')
            .addField(`🏆 ${config.staffPrefix}xp (@miembro | id) (set | add | remove | clear) [cantidad]`, `Modifica la cantidad de XP de un miembro${resources.shield}`)
            .setFooter(`Escudo: Solo para Supervisores`, message.guild.iconURL());
        
        message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        message.author.send(helpEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

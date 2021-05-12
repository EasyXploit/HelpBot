exports.run = async (discord, client, message, args, command) => {
    
    //-staff
    
    try {
        message.delete();
        
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setDescription(`${client.emotes.greenTick} ¡Te he enviado los detalles por Mensaje Directo!`);

        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setThumbnail('https://i.imgur.com/iODevD9.png')
            .setAuthor('STAFF', 'https://i.imgur.com/iODevD9.png')
            .setTitle('Comandos para el Staff del servidor')
            .addField(`🔄 ${client.config.prefixes.staffPrefix}restart`, `Reinicia a ${client.user.username}.`)
            .addField(`:stop_button: ${client.config.prefixes.staffPrefix}stop`, `Detiene a ${client.user.username}  *`)
            .addField(`🙍 ${client.config.prefixes.staffPrefix}userinfo (@usuario | id | nada)`, 'Muestra información acerca del usuario mencionado')
            .addField(`🖥 ${client.config.prefixes.staffPrefix}serverinfo`, 'Muestra información acerca de la guild actual')
            .addField(`🔖 ${client.config.prefixes.staffPrefix}roleinfo (@rol | rol | id)`, 'Muestra información acerca de un rol')
            .addField(`${client.emotes.orangeTick} ${client.config.prefixes.staffPrefix}warn (@miembro | id) (razón)`, 'Advierte a un usuario')
            .addField(`📑 ${client.config.prefixes.staffPrefix}infractions (@miembro | id | nada)`, `Visualiza las advertencias de un usuario`)
            .addField(`📤 ${client.config.prefixes.staffPrefix}rmwarn (@miembro | id) (id de advertencia | all) (razón)`, `Retira una advertencia a un usuario`)
            .addField(`🔇 ${client.config.prefixes.staffPrefix}mute (@usuario | id) (motivo)`, `Silencia a un miembro *`)
            .addField(`🔈 ${client.config.prefixes.staffPrefix}tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)`, 'Silencia a un usuario de forma temporal')
            .addField(`🔊 ${client.config.prefixes.staffPrefix}unmute (@usuario | id) (motivo)`, `Des-silencia a un miembro *`)
            .addField(`⛔ ${client.config.prefixes.staffPrefix}kick (@usuario | id)) (motivo)`, `Expulsa a un miembro *`)
            .addField(`:hammer: ${client.config.prefixes.staffPrefix}ban (@usuario | id) (motivo)`, `Banea a un usuario *`)
            .addField(`🕑 ${client.config.prefixes.staffPrefix}tempban (@usuario | id) (xS | xM | xH | xD) (motivo)`, `Banea a un usuario de forma temporal *`)
            .addField(`🛡 ${client.config.prefixes.staffPrefix}softban (@usuario | id) (1 - 7) (motivo)`, `Banea a un usuario y borra sus mensajes (máx 7 días) *`)
            .addField(`${client.emotes.greenTick} ${client.config.prefixes.staffPrefix}unban (id) (motivo)`, `Desbanea a un usuario *`)
            .addField(`⏱ ${client.config.prefixes.staffPrefix}slowmode (off | segundos [5-30]) (razón)`, `Activa el modo lento en un canal`)
            .addField(`💭 ${client.config.prefixes.staffPrefix}send (mensaje)`, `Envía un mensaje desde ${client.user.username}`)
            .addField(`📬 ${client.config.prefixes.staffPrefix}dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)`, 'Envio de mensajes directos')
            .addField(`📊 ${client.config.prefixes.staffPrefix}poll (nada | new | end) [id]`, 'Envia una encuesta al canal actual')
            .addField(`🏆 ${client.config.prefixes.staffPrefix}xp (@miembro | id) (set | add | remove | clear) [cantidad]`, `Modifica la cantidad de XP de un miembro *`)
            .setFooter(`*: Solo para Supervisores`, message.guild.iconURL());
        
        message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        message.author.send(helpEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}

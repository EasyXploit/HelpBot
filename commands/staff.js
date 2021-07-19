exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!staff
    
    try {
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setDescription(`${client.customEmojis.greenTick} ¡Te he enviado los detalles por Mensaje Directo!`);

        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setThumbnail('https://i.imgur.com/iODevD9.png')
            .setAuthor('STAFF', 'https://i.imgur.com/iODevD9.png')
            .setTitle('Comandos para el Staff del servidor')
            .addField(`🔄 ${client.config.guild.prefix}restart`, `Reinicia a ${client.user.username}.`)
            .addField(`:stop_button: ${client.config.guild.prefix}stop`, `Detiene a ${client.user.username}  *`)
            .addField(`🙍 ${client.config.guild.prefix}userinfo (@usuario | id | nada)`, 'Muestra información acerca del usuario mencionado')
            .addField(`🖥 ${client.config.guild.prefix}serverinfo`, 'Muestra información acerca de la guild actual')
            .addField(`🔖 ${client.config.guild.prefix}roleinfo (@rol | rol | id)`, 'Muestra información acerca de un rol')
            .addField(`${client.customEmojis.orangeTick} ${client.config.guild.prefix}warn (@miembro | id) (razón)`, 'Advierte a un usuario')
            .addField(`📑 ${client.config.guild.prefix}infractions (@miembro | id | nada)`, `Visualiza las advertencias de un usuario`)
            .addField(`📤 ${client.config.guild.prefix}rmwarn (@miembro | id) (id de advertencia | all) (razón)`, `Retira una advertencia a un usuario`)
            .addField(`🔇 ${client.config.guild.prefix}mute (@usuario | id) (motivo)`, `Silencia a un miembro *`)
            .addField(`🔈 ${client.config.guild.prefix}tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)`, 'Silencia a un usuario de forma temporal')
            .addField(`🔊 ${client.config.guild.prefix}unmute (@usuario | id) (motivo)`, `Des-silencia a un miembro *`)
            .addField(`⛔ ${client.config.guild.prefix}kick (@usuario | id)) (motivo)`, `Expulsa a un miembro *`)
            .addField(`:hammer: ${client.config.guild.prefix}ban (@usuario | id) (motivo)`, `Banea a un usuario *`)
            .addField(`🕑 ${client.config.guild.prefix}tempban (@usuario | id) (xS | xM | xH | xD) (motivo)`, `Banea a un usuario de forma temporal *`)
            .addField(`🛡 ${client.config.guild.prefix}softban (@usuario | id) (1 - 7) (motivo)`, `Banea a un usuario y borra sus mensajes (máx 7 días) *`)
            .addField(`${client.customEmojis.greenTick} ${client.config.guild.prefix}unban (id) (motivo)`, `Desbanea a un usuario *`)
            .addField(`⏱ ${client.config.guild.prefix}slowmode (off | segundos [5-30]) (razón)`, `Activa el modo lento en un canal`)
            .addField(`💭 ${client.config.guild.prefix}send (mensaje)`, `Envía un mensaje desde ${client.user.username}`)
            .addField(`📬 ${client.config.guild.prefix}dm (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)`, 'Envio de mensajes directos')
            .addField(`📊 ${client.config.guild.prefix}poll (nada | new | end) [id]`, 'Envia una encuesta al canal actual')
            .addField(`🏆 ${client.config.guild.prefix}xp (@miembro | id) (set | add | remove | clear) [cantidad]`, `Modifica la cantidad de XP de un miembro *`)
            .setFooter(`*: Solo para Supervisores`, message.guild.iconURL());
        
        message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        message.author.send(helpEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}

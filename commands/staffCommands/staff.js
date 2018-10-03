exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-staff
    
    try {
        message.delete();
        
        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription(resources.GreenTick + ' ¡Te he enviado los detalles por Mensaje Directo!');

        let helpEmbed = new discord.RichEmbed()
            .setColor(0x1A936F)
            .setThumbnail('http://i.imgur.com/l0EinOe.png')
            .setAuthor('STAFF', 'http://i.imgur.com/l0EinOe.png')
            .setTitle('Comandos para el Staff del servidor')
            .setFooter('© 2018 República Gamer LLC | Medalla: Solo para Supervisores', message.guild.iconURL)
            .addField('🔄 ' + config.staffPrefix + 'reiniciar', 'Reinicia a ' + bot.user.username, true)
            .addField(':stop_button: ' + config.staffPrefix + 'detener', 'Detiene a ' + bot.user.username + ' :key:', true)
            .addField('🙍 ' + config.staffPrefix + 'infousuario (@usuario | id)', 'Muestra información acerca del usuario mencionado' + resources.beta, true)
            .addField('🖥 ' + config.staffPrefix + 'infoservidor', 'Muestra información acerca de la guild actual', true)
            .addField('🔖 ' + config.staffPrefix + 'inforol (@rol | "rol" | id)', 'Muestra información acerca de un rol', true)
            .addField('🔈 ' + config.staffPrefix + 'silenciar (@usuario | id) (motivo)', 'Silencia a un usuario' + resources.chevron10 + resources.beta, true)
            .addField('🔊 ' + config.staffPrefix + 'dessilenciar (@usuario | id) (motivo)', 'Des-silencia a un usuario' + resources.chevron10 + resources.beta, true)
            .addField('🔄 ' + config.staffPrefix + 'expulsar (@usuario | id)) (motivo)', 'Expulsa a un usuario' + resources.chevron10 + resources.beta, true)
            .addField(':hammer: ' + config.staffPrefix + 'banear (@usuario | id) (motivo)', 'Banea a un usuario' + resources.chevron10 + resources.beta, true)
            .addField('🛡 ' + config.staffPrefix + 'softban (@usuario | id) (motivo)', 'Banea a un usuario y borra sus mensajes (máx 14 días)' + resources.chevron10 + resources.beta, true)
            .addField(resources.GreenTick + ' ' + config.staffPrefix + 'desbanear (id) (motivo)', 'Desbanea a un usuario' + resources.chevron10 + resources.beta, true)
            .addField('🔧 ' + config.staffPrefix + 'herramientas', 'Muestra las herramientas de moderación que proporciona <@159985870458322944>', true)
            .addField('🔖 ' + config.staffPrefix + 'asignar-rol (@rol | "rol" | id) (@usuario | id)', 'Añade un determinado rol a un determinado usuario', true)
            .addField('🔖 ' + config.staffPrefix + 'quitar-rol (@rol | "rol" | id) (@usuario | id)', 'Retira un determinado rol a un determinado usuario', true)
            .addField('💭 ' + config.staffPrefix + 'envia (mensaje)', 'Envía un mensaje desde ' + bot.user.username, true)
            .addField('📬 ' + config.staffPrefix + 'md (autor | anonimo | broadcast) (@usuario | id / nada) (mensaje a enviar)', 'Envio de mensajes directos', true)
            .addField('📊 ' + config.staffPrefix + 'encuesta "título" "campo1" "campo2" ...', 'Envia una encuesta al canal actual', true)
            .addField('👁 ' + config.staffPrefix + 'registra (#canal) (xS/xM/xH)', 'Hará que ' + bot.user.username + ' registre los mensajes enviados durante el tiempo especificado.' + resources.beta + '.')
            .addField(resources.pokeball + ' ' + config.staffPrefix + 'spawn <"url">', 'Spawnea un pokémon en base a la URL de imágen proporcionada', true);
        
        message.channel.send(successEmbed).then(msg => {msg.delete(1000)});
        message.author.send(helpEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

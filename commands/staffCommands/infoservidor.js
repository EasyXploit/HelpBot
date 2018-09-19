exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);
    
    try {
        
        const guild = message.guild;
        
        let resultEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('Información del servidor', guild.iconURL)
            .setDescription('Mostrando información acerca de la guild ' + guild.name)
            .setThumbnail(guild.iconURL)
            .addField('Nombre', guild.name, true)
            .addField('ID', guild.id, true)
            .addField('Propietario', guild.owner + ' (ID: ' + guild.ownerID + ')', true)
            .addField('Fecha de creación', guild.createdAt.toUTCString(), true)
            .addField('Región', guild.region, true)
            .addField('Canal de AFK', guild.afkChannel.name + '\nTimeout: ' + guild.afkTimeout + ' segundos', true)
            .addField('Large guild (+250)', guild.large, true)
            .addField('Nivel de verificación', guild.verificationLevel, true)
            .addField('Roles', guild.roles.size, true)
            .addField('Miembros', guild.memberCount + ' miembros\n' + guild.members.filter(m => m.user.presence.status == 'online').size + ' online\n' + guild.members.filter(m => m.user.bot).size + ' bots, ' + guild.members.filter(m => !m.user.bot).size + ' humanos', true)
            .addField('Canales', guild.channels.filter(c => c.channels).size + ' canales\n'/* + guild.channels.filter(c => c.channels.type == 'text').size + ' de txto, ' + guild.channels.filter(c => c.channels.type == 'voice').size + ' de voz'*/, true)
            
        message.channel.send(resultEmbed);
        
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
}

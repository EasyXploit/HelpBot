exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});
    
    //-infousuario (@usuario | id)
    
    try {
        let noUserEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No has proporcionado un usuario válido');
        
        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No puedes obtener información de un bot');
        
        //let toInfo;
        let member;

        if (args.length < 1) {
            member = message.guild.members.get(message.author.id);
        } else {
            member = message.mentions.members.first() || message.guild.members.get(args[0]);
        }
        
        if (!member) return message.channel.send(noUserEmbed);
        
        let user = member.user;
        if (user.bot) return message.channel.send(noBotsEmbed);
        
        //Comprueba si el usuario es baneable
        let bannable = 'No';
        if (member.bannable === true) {bannable = 'Si'};
        
        //Comprueba los permisos del usuario
        let status = [];
        if (member.id === message.guild.owner.id) {status.push('Propietario')};
        if (member.hasPermission('ADMINISTRATOR')) {status.push('Administrador')};
        if (member.hasPermission('MANAGE_MESSAGES')) {status.push('Moderador')};
        
        if (status.length < 1) {status.push('Usuario regular')};
        
        let perms = member.permissions.serialize();
        let permsArray = Object.keys(perms).filter(function(x) { 
            return perms[x] !== false; 
        });
        
        let resultEmbed = new discord.RichEmbed()
            .setColor(member.displayHexColor)
            .setTitle('🙍 Información de usuario')
            .setDescription('Mostrando información acerca del usuario <@' + member.id + '>')
            .setThumbnail(user.displayAvatarURL)
            .addField('Nickname', member.displayName, true)
            .addField('TAG completo', user.tag, true)
            .addField('ID del usuario', member.id, true)
            .addField('Permisos', permsArray.join(', ').toLowerCase(),true)
            .addField('Baneable', bannable, true)
            .addField('Fecha de registro', user.createdAt.toUTCString(), true)
            .addField('Unido al servidor', member.joinedAt.toUTCString(), true)
            .addField('Estatus', status.join(', '), true)
            .addField('Rol más alto', member.highestRole.name, true)
            .addField('Último mensaje', member.lastMessage + ' (ID: ' + member.lastMessageID + ')', true)
            .addField('Infracciones', '_Aún no disponible_', true)
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

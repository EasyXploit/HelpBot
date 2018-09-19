exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);
    
    try {
        let noMentionEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ No has proporcionado un rol válido');
        
        let guild = message.guild;
        let role = message.mentions.roles.first() || message.guild.roles.find ('name', args[0]) || message.guild.roles.get(args[0]);
        if (!role) return message.channel.send(noMentionEmbed);

        let membersWithRole = message.guild.roles.get(role.id).members.size;
        let mentionable;
        let hoisted;
        let managed;
        
        if (role.mentionable === true) {
            mentionable = 'Si';
        } else if (role.mentionable === false) {
            mentionable = 'No';
        }
        
        if (role.hoist === true) {
            hoisted = 'Visible';
        } else if (role.hoist === false) {
            hoisted = 'Oculto';
        }
        
        if (role.managed === true) {
            managed = 'Externa';
        } else if (role.hoist === false) {
            managed = 'Local';
        }
        
        let resultEmbed = new discord.RichEmbed()
            .setColor(role.hexColor)
            .setTitle('🔖 Información de rol')
            .setDescription('Mostrando información acerca del rol <@&' + role.id + '>')
            .addField('Nombre del rol', role.name, true)
            .addField('ID del rol', role.id, true)
            .addField('Miembros con el rol', membersWithRole, true)
            .addField('Mencionable', mentionable, true)
            .addField('Se muestra', hoisted, true)
            .addField('Color', role.hexColor, true)
            .addField('Fecha de creación', role.createdAt.toUTCString(), true)
            .addField('Administración', managed, true)

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

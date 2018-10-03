exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});
    
    //-inforol (@rol | "rol" | id)
    
    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.staffPrefix + 'inforol (@rol | "rol" | id)`');
        
        let guild = message.guild;
        let role = message.mentions.roles.first() || guild.roles.get(args[0]) || message.guild.roles.find('name', args[0]);
        if (!role) {
            let newArgs = message.content.slice(10).split('"').slice(0, 1).join();
            role = message.guild.roles.find('name', newArgs)
        }
        
        if (!role) return message.channel.send(noCorrectSyntaxEmbed);

        let membersWithRole = message.guild.roles.get(role.id).members.size;
        let mentionable = 'No';
        let hoisted = 'Oculto';
        let managed = 'Local';
        
        if (role.mentionable === true) {mentionable = 'Si'};
        if (role.hoist === true) {hoisted = 'Visible'};
        if (role.managed === true) {managed = 'Externa'};
        
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
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

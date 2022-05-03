exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba si los parámetros se han proporcionado correctamente
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca el rol en la guild
        const role = await client.functions.fetchRole(message.guild, args[0]);

        //Si el rol no existe, devuelve un error
        if (!role) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.roleNotFound, { role: args[0] })}.`)
        ]});

        //Serializa los permisos del rol
        const rolePermissions = role.permissions.serialize();

        //Obtiene los nombres de los permisos
        const permissionsArray = Object.keys(rolePermissions).filter(permission => {
            return rolePermissions[permission] !== false;
        });

        //Almacena los permisos traducidos
        let translatedPermissions = [];

        //Traduce los permisos del rol
        permissionsArray.forEach(async (permission) => translatedPermissions.push(client.locale.permissions[permission] || permission));

        //Envía un embed con la información del rol
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(role.hexColor)
            .setTitle(`🔖 ${locale.resultEmbed.title}`)
            .setDescription(client.functions.localeParser(locale.resultEmbed.description, { role: role }))
            .setThumbnail(role.iconURL())
            .addField(`🏷 ${locale.resultEmbed.roleName}`, `${role.name}${role.unicodeEmoji ? ` ${role.unicodeEmoji}` : ''}`, true)
            .addField(`🆔 ${locale.resultEmbed.roleId}`, role.id, true)
            .addField(`👥 ${locale.resultEmbed.roleMembers}`, role.members.size.toString(), true)
            .addField(`🗣 ${locale.resultEmbed.mentionable}`, role.mentionable ? locale.resultEmbed.isMentionable : locale.resultEmbed.isntMntionable, true)
            .addField(`👁️‍ ${locale.resultEmbed.hoisted}`, role.hoist ? locale.resultEmbed.isHoisted : locale.resultEmbed.isntHoisted, true)
            .addField(`🎨 ${locale.resultEmbed.color}`, role.hexColor, true)
            .addField(`📝 ${locale.resultEmbed.creationDate}`, `<t:${Math.round(role.createdTimestamp / 1000)}>`, true)
            .addField(`🤖 ${locale.resultEmbed.integration}`, role.managed ? locale.resultEmbed.isIntegration : locale.resultEmbed.isntIntegration, true)
            .addField(`👮 ${locale.resultEmbed.permissions}`, `\`\`\`${translatedPermissions.join(', ')}\`\`\``)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'roleinfo',
    aliases: ['role']
};

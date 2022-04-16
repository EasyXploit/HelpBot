exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba si los parámetros se han proporcionado correctamente
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca el rol en la guild
        const role = await client.functions.fetchRole(message.guild, args[0]);

        //Si el rol no existe, devuelve un error
        if (!role) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} El rol **${args[0]}** no existe`)
        ]});

        //Serializa los permisos del rol
        const rolePermissions = role.permissions.serialize();

        //Obtiene los nombres de los permisos
        const permissionsArray = Object.keys(rolePermissions).filter(permission => {
            return rolePermissions[permission] !== false;
        });

        //Almacena las traducciones de los permisos
        const translations = require(`../../resources/locales/${client.config.main.language}.json`).permissions;

        //Almacena los permisos traducidos
        let translatedPermissions = [];

        //Traduce los permisos del rol
        permissionsArray.forEach(async (permission) => translatedPermissions.push(translations[permission] || permission));

        //Envía un embed con la información del rol
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(role.hexColor)
            .setTitle('🔖 Información de rol')
            .setDescription(`Mostrando información acerca del rol ${role}`)
            .addField('🏷 Nombre del rol', role.name, true)
            .addField('🆔 ID del rol', role.id, true)
            .addField('👥 Miembros con el rol', role.members.size.toString(), true)
            .addField('🗣 Mencionable', role.mentionable ? 'Si' : 'No', true)
            .addField('👁️‍ Se muestra', role.hoist ? 'Visible' : 'Oculto', true)
            .addField('🔰 Color', role.hexColor, true)
            .addField('📝 Fecha de creación', `<t:${Math.round(role.createdTimestamp / 1000)}>`, true)
            .addField('🤖 Integración', role.managed ? 'Si' : 'No', true)
            .addField('👮 Permisos específicos', `\`\`\`${translatedPermissions.join(', ')}\`\`\``)
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

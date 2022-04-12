exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Almacena el miembro objetivo
        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);

        //Comprueba si se ha proporcionado un miembro válido
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`)
        ]});

        //Comprueba, si corresponde, que el miembro tenga permiso para ver los datos de otros
        if (message.member.id !== member.id) {

            //Variable para saber si está autorizado
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let index = 0; index < commandConfig.canSeeAny.length; index++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(role => role.id === commandConfig.canSeeAny[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)]
            }).then(msg => { setTimeout(() => msg.delete(), 5000) });
        };

        //Comprueba los status de los que dispone el miembro
        let status = [];
        if (member.id === message.guild.ownerId) status.push('Propietario');
        if (member.permissions.has('ADMINISTRATOR')) status.push('Administrador');
        if (member.permissions.has('MANAGE_MESSAGES')) status.push('Moderador');
        if (status.length < 1) status.push('Usuario regular');

        //Serieliza los permisos del miembro
        const memberPermissions = member.permissions.serialize();

        //Obtiene los nombres de los permisos
        const permissionsArray = Object.keys(memberPermissions).filter(function (x) {
            return memberPermissions[x] !== false;
        });

        //Almacena las traducciones de los permisos
        const translations = require('../../resources/translations/permissions.json');

        //Almacena los permisos traducidos
        let translatedPermissions = [];

        //Traduce los permisos del miembro
        permissionsArray.forEach(async (permission) => translatedPermissions.push(translations[permission] || permission));

        //Almacena la sanción actual, si aplica
        let sanction;

        //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración)
        if (client.db.mutes[member.id] && client.db.mutes[member.id].until) sanction = `Silenciado hasta <t:${Math.round(new Date(client.db.mutes[member.id].until) / 1000)}>`;
        else if (client.db.mutes[member.id] && !client.db.mutes[member.id].until) sanction = 'Silenciado indefinidamente';

        //Envía un embed con el resultado del comando
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`🙍 Información sobre ${member.displayName}`)
            .setDescription(`Mostrando información acerca de **${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField('🆔 ID del miembro', member.id, true)
            .addField('📝 Fecha de registro', `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)
            .addField('↙ Unido al servidor', `<t:${Math.round(member.joinedTimestamp / 1000)}>`, true)
            .addField('👑 Estatus', status.join(', '), true)
            .addField('💎 Nitro Booster', member.premiumSince ? `Desde <t:${Math.round(member.premiumSinceTimestamp / 1000)}>` : 'No', true)
            .addField('🎖 Rol más alto', member.roles.highest.name, true)
            .addField('⚖ Infracciones', client.db.warns[member.id] ? (Object.keys(client.db.warns[member.id]).length).toString() : '0', true)
            .addField('📓 Verificación', member.pending ? 'Verificación pendiente' : 'Verificado', true)
            .addField('⚠️ Sanción actual', sanction || 'Ninguna', true)
            .addField('👮 Permisos efectivos', `\`\`\`${translatedPermissions.join(', ')}\`\`\``)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'userinfo',
    description: 'Muestra información sobre ti o cualquier otro miembro.',
    aliases: ['user'],
    parameters: '[@miembro | id]'
};

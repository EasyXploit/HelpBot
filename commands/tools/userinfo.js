exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Almacena el miembro objetivo
        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);

        //Comprueba si se ha proporcionado un miembro válido
        if (!member) return message.channel.send({ embeds: [
            new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`)
            ]
        });

        //Comprueba, si corresponde, que el miembro tenga permiso para ver los datos de otros
        if (message.member.id !== member.id) {

            //Variable para saber si está autorizado
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let i = 0; i < commandConfig.canSeeAny.length; i++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.canSeeAny[i])) {
                    authorized = true;
                    break;
                };
            };

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)]
            }).then(msg => {setTimeout(() => msg.delete(), 5000)});
        };

        //Comprueba los status de los que dispone el miembro
        let status = [];
        if (member.id === message.guild.ownerId) status.push('Propietario');
        if (member.permissions.has(`ADMINISTRATOR`)) status.push('Administrador');
        if (member.permissions.has(`MANAGE_MESSAGES`)) status.push('Moderador');
        if (status.length < 1) status.push('Usuario regular');

        //Comprueba los permisos del miembro
        let memberPermissions = member.permissions.serialize();
        let permissionsArray = Object.keys(memberPermissions).filter(function (x) {
            return memberPermissions[x] !== false;
        });

        //Almacena las traducciones de los permisos
        let translations = require(`../../resources/translations/permissions.json`);

        //Traduce los permisos del miembro
        let translatedPermissions = [];
        permissionsArray.forEach(async (permission) => {
            translatedPermissions.push(translations[permission]);
        });

        //Comprueba si existe el rol silenciado, sino lo crea
        let mutedRole = await client.functions.checkMutedRole(message.guild);

        //Comprueba si el miembro está silenciado
        let sanction;
        if (client.db.mutes[member.id]) {
            sanction = `Silenciado hasta ${new Date(client.db.mutes[member.id].time).toLocaleString()}`;
        } else if (member.roles.cache.has(mutedRole.id)) {
            sanction = 'Silenciado indefinidamente';
        };

        //Genera el embed con el resultado del comando
        let resultEmbed = new client.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`🙍 Información sobre ${member.displayName}`)
            .setDescription(`Mostrando información acerca de **${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField('🆔 ID del miembro', member.id, true)
            .addField('📝 Fecha de registro', member.user.createdAt.toLocaleString(), true)
            .addField('↙ Unido al servidor', member.joinedAt.toLocaleString(), true)
            .addField('👑 Estatus', status.join(', '), true)
            .addField('💎 Nitro Booster', member.premiumSince ? `Desde ${member.premiumSince.toLocaleString()}` : 'No', true)
            .addField('🎖 Rol más alto', member.roles.highest.name, true)
            .addField('⚖ Infracciones', client.db.warns[member.id] ? (Object.keys(client.db.warns[member.id]).length).toString() : '0', true)
            .addField('📓 Reglas', member.pending ? 'Aceptación pendiente' : 'Aceptadas', true)
            .addField('⚠️ Sanción actual', sanction || 'Ninguna', true)
            .addField('👮 Permisos', `\`\`\`${translatedPermissions.join(', ')}\`\`\``);
        
        //Envía el embed
        await message.channel.send({ embeds: [resultEmbed] });

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'userinfo',
    description: 'Muestra información sobre ti o cualquier otro miembro.',
    aliases: ['user'],
    parameters: '[@miembro | id]'
};

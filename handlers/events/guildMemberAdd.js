export default async (member, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (member.guild.id !== client.baseGuild.id) return;

        //Almacena el aislamiento del miembro 
        const memberTimeout = await client.functions.db.getData('timeout', member.id);

        //Si el miembro tiene un aislamiento en vigor y se le debe retirar, o no lo tiene y se tiene que desregistrar
        if ((member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() && !memberTimeout) || (!member.communicationDisabledUntilTimestamp && memberTimeout)) {

            //Comprueba si el bot tiene los permisos requeridos
            const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ModerateMembers']);
            if (missingPermissions) return logger.warn(`The bot could not un-timeout ${member.user.tag} (${member.id}) because it did not have permission to do so`);

            //Habilita la comunicación del miembro en el servidor
            await member.disableCommunicationUntil(null, locale.communicationEnabled.reason);

            //Si tiene registrado el aislamiento
            if (memberTimeout) {

                //Elimina la entrada de la base de datos
                await client.functions.db.delData('timeout', member.id);
            };
        };

        //Si el nuevo miembro es un bot
        if (member.user.bot) {

            //Almacena el ID del rol para nuevos bots
            const newBotRoleId = await client.functions.db.getConfig('welcomes.newBotRoleId');

            //Si hay un rol configurado
            if (newBotRoleId && newBotRoleId.length > 0) {

                //Comprueba si el bot tiene los permisos requeridos
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['MANAGE_ROLES']);
                if (missingPermissions) logger.warn(`The bot could not add the welcome role to the bot ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else if (!member.roles.cache.has(newBotRoleId)) await member.roles.add(newBotRoleId); //Añade el rol de bienvenida para nuevos bots (si no lo tiene ya)
            };

            //Envía un mensaje al canal de registro
            await client.functions.managers.sendLog('botJoined', 'embed', new discord.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { memberTag: member.user.tag })}.`)
            );

            //Aborta el resto del script
            return;
        };
        
        //Almacena el modo de manejo de nuevos miembros
        const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');

        //Ejecuta el manejador de nuevos miembros (si procede)
        if (newMemberMode === 0) await client.functions.managers.newMember(member);

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError(error);
    };
};

module.exports = async (oldMember, newMember, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (oldMember.guild.id !== client.baseGuild.id) return;

        //Si el miembro ha pasado la pantalla de verificación
        if (oldMember.pending && !newMember.pending) {

            //Almacena el perfil del miembro, si es que existe
            let memberProfile = await client.functions.db.getData('profile', member.id);

            //Si el miembro tiene entradas en la tabla de estadísticas, asigna las recompensas que le corresponda
            if (memberProfile && await client.functions.db.getConfig('leveling.preserveStats')) await client.functions.leveling.assignRewards(newMember, memberProfile.stats.level);

            //Almacena el modo de manejo de nuevos miembros
            const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');

            //Ejecuta el manejador de nuevos miembros (si procede)
            if (newMemberMode === 1) await client.functions.managers.newMember(newMember);
        };

        //Si el miembro ha sido silenciado o dessilenciado
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {

            //Almacena la expiración del aislamiento
            let expiration = newMember.communicationDisabledUntilTimestamp;
            
            //Genera variables para almacenar los campos de los embeds
            let executor = null, reason = null;

            //Busca el último aislamiento en el registro de auditoría
            const fetchedLogs = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_UPDATE',
            });

            //Almacena el primer resultado de la búsqueda
            const timeoutLog = fetchedLogs.entries.first();
            
            //Si se encontró un aislamiento en el primer resultado, y han pasado menos de 5 segundos
            if (timeoutLog && (timeoutLog.createdTimestamp > (Date.now() - 5000)) && timeoutLog.target.id === newMember.id) {

                //Actualiza los campos de ejecutor y razón
                executor = timeoutLog.executor;
                reason = timeoutLog.reason;
            };

            //Almacena la caché de registros del usuario silenciao o dessilenciado, si existe
            const loggingCache = (client.loggingCache && client.loggingCache[newMember.id]) ? client.loggingCache[newMember.id] : null;
        
            //Si se trata de una caché de usuario silenciao o dessilenciado
            if (loggingCache && loggingCache.action.includes('timeout')) {

                //Almacena al moderador correcto
                if (!executor) executor = await client.users.fetch(loggingCache.executor);

                //Almacena la razón formateada
                if (!reason) reason = loggingCache.reason;

                //Borra la caché de registros del miembro
                delete client.loggingCache[newMember.id];
            };

            //Si se ha silenciado
            if (newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now()) {

                //Envía un mensaje al canal de registros
                await client.functions.managers.sendLog('timeoutedMember', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setAuthor({ name: await client.functions.utilities.parseLocale(locale.communicationDisabled.loggingEmbed.author, { memberTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.communicationDisabled.loggingEmbed.memberId, value: newMember.id, inline: true },
                        { name: locale.communicationDisabled.loggingEmbed.moderator, value: executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.communicationDisabled.loggingEmbed.reason, value: reason || locale.communicationDisabled.loggingEmbed.undefinedReason, inline: true },
                        { name: locale.communicationDisabled.loggingEmbed.expiration, value: `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>`, inline: true }
                    )
                );

                //Envía una notificación al miembro
                await newMember.send({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setAuthor({ name: locale.communicationDisabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale(locale.communicationDisabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                    .addFields(
                        { name: locale.communicationDisabled.privateEmbed.moderator, value: executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.communicationDisabled.privateEmbed.reason, value: reason || locale.communicationDisabled.privateEmbed.undefinedReason, inline: true },
                        { name: locale.communicationDisabled.privateEmbed.expiration, value: `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>`, inline: true }
                    )
                ]});

            //Si se ha dessilenciado
            } else {

                //Almacena el aislamiento del miembro 
                const memberTimeout = await client.functions.db.getData('timeout', newMember.id);

                //Si el aislamiento estaba registrado en la base de datos
                if (memberTimeout) {

                    //Elimina la entrada de la base de datos
                    await client.functions.db.delData('timeout', newMember.id);
                };

                //Envía un mensaje al canal de registros
                await client.functions.managers.sendLog('untimeoutedMember', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                    .setAuthor({ name: await client.functions.utilities.parseLocale(locale.communicationEnabled.loggingEmbed.author, { userTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL({dynamic: true})})
                    .addFields(
                        { name: locale.communicationEnabled.loggingEmbed.memberId, value: newMember.id.toString(), inline: true },
                        { name: locale.communicationEnabled.loggingEmbed.moderator, value: executor ? executor.tag : locale.communicationEnabled.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.communicationEnabled.loggingEmbed.reason, value: reason || locale.communicationEnabled.loggingEmbed.undefinedReason, inline: true }
                    )
                );

                //Envía una notificación al miembro
                await newMember.send({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                    .setAuthor({ name: locale.communicationEnabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale(locale.communicationEnabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                    .addFields(
                        { name: locale.communicationEnabled.privateEmbed.moderator, value: executor ? executor.tag : locale.communicationEnabled.privateEmbed.unknownModerator, inline: true },
                        { name: locale.communicationEnabled.privateEmbed.reason, value: reason || locale.communicationEnabled.privateEmbed.undefinedReason, inline: true }
                    )
                ]});
            };
        };

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError(error);
    };
};

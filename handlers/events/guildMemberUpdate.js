exports.run = async (oldMember, newMember, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (oldMember.guild.id !== client.homeGuild.id) return;

        //Si el miembro ha pasado la pantalla de verificación
        if (oldMember.pending && !newMember.pending) {

            //Si el miembro tiene entradas en la tabla de estadísticas, asigna las recompensas que le corresponda
            if (client.db.stats[newMember.id] && client.config.leveling.preserveStats) await client.functions.leveling.assignRewards.run(client, newMember, client.db.stats[newMember.id].level);

            //Ejecuta el manejador de nuevos miembros (si procede)
            if (client.config.main.newMemberMode === 1) await client.functions.managers.newMember.run(client, newMember);
        };

        //Si el miembro ha sido silenciado o dessilenciado
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {

            //Almacena la expiración del silenciamiento
            let expiration = newMember.communicationDisabledUntilTimestamp;
            
            //Genera variables para almacenar los campos de los embeds
            let executor = null, reason = null;

            //Busca el último silenciamiento en el registro de auditoría
            const fetchedLogs = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_UPDATE',
            });

            //Almacena el primer resultado de la búsqueda
            const timeoutLog = fetchedLogs.entries.first();
            
            //Si se encontró un silenciamiento en el primer resultado, y han pasado menos de 5 segundos
            if (timeoutLog && (timeoutLog.createdTimestamp > (Date.now() - 5000)) && timeoutLog.target.id === newMember.id) {

                //Actualiza los campos de ejecutor y razón
                executor = timeoutLog.executor;
                reason = timeoutLog.reason;
            };

            //Almacena la caché de registros del usuario silenciao o dessilenciado, si existe
            const loggingCache = (client.loggingCache && client.loggingCache[newMember.id]) ? client.loggingCache[newMember.id] : null;
        
            //Si se trata de una caché de usuario silenciao o dessilenciado
            if (loggingCache && loggingCache.action.includes('mute')) {

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
                if (client.config.logging.mutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.communicationDisabled.loggingEmbed.author, { memberTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.communicationDisabled.loggingEmbed.memberId, value: newMember.id, inline: true },
                        { name: locale.communicationDisabled.loggingEmbed.moderator, value: executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.communicationDisabled.loggingEmbed.reason, value: reason || locale.communicationDisabled.loggingEmbed.undefinedReason, inline: true },
                        { name: locale.communicationDisabled.loggingEmbed.expiration, value: `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>`, inline: true }
                    )
                );

                //Envía una notificación al miembro
                await newMember.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: locale.communicationDisabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.communicationDisabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                    .addFields(
                        { name: locale.communicationDisabled.privateEmbed.moderator, value: executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.communicationDisabled.privateEmbed.reason, value: reason || locale.communicationDisabled.privateEmbed.undefinedReason, inline: true },
                        { name: locale.communicationDisabled.privateEmbed.expiration, value: `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>`, inline: true }
                    )
                ]});

            //Si se ha dessilenciado
            } else {

                //Si el silenciamiento estaba registrado en la base de datos
                if (client.db.mutes[newMember.id]) {

                    //Elimina la entrada de la base de datos
                    delete client.db.mutes[newMember.id];

                    //Sobreescribe el fichero de la base de datos con los cambios
                    await client.fs.writeFile('./storage/databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

                        //Si hubo un error, lo lanza a la consola
                        if (err) throw err;
                    });
                };

                //Envía un mensaje al canal de registros
                if (client.config.logging.unmutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.communicationEnabled.loggingEmbed.author, { userTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL({dynamic: true})})
                    .addFields(
                        { name: locale.communicationEnabled.loggingEmbed.memberId, value: newMember.id.toString(), inline: true },
                        { name: locale.communicationEnabled.loggingEmbed.moderator, value: executor ? executor.tag : locale.communicationEnabled.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.communicationEnabled.loggingEmbed.reason, value: reason || locale.communicationEnabled.loggingEmbed.undefinedReason, inline: true }
                    )
                );

                //Envía una notificación al miembro
                await newMember.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: locale.communicationEnabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.communicationEnabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                    .addFields(
                        { name: locale.communicationEnabled.privateEmbed.moderator, value: executor ? executor.tag : locale.communicationEnabled.privateEmbed.unknownModerator, inline: true },
                        { name: locale.communicationEnabled.privateEmbed.reason, value: reason || locale.communicationEnabled.privateEmbed.undefinedReason, inline: true }
                    )
                ]});
            };
        };

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError.run(client, error);
    };
};

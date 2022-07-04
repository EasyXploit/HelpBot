exports.run = async (oldMember, newMember, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (oldMember.guild.id !== client.homeGuild.id) return;

        //Si el miembro ha pasado la pantalla de verificación
        if (oldMember.pending && !newMember.pending) {

            //Si el miembro tiene entradas en la tabla de estadísticas, asigna las recompensas que le corresponda
            if (client.db.stats[newMember.id] && client.config.xp.preserveStats) await client.functions.leveling.assignRewards.run(client, newMember, client.db.stats[newMember.id].level);

            //Ejecuta el manejador de nuevos miembros (si procede)
            if (client.config.main.newMemberMode === 'after') await client.functions.managers.newMember.run(client, newMember);
        };

        //Si el miembro ha sido silenciado o dessilenciado
        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {

            /**
             * 
             * FALTA BUSCAR EN AUDITORÍA EN LUGAR DE NO SER INCONCLUSIVO EL 100% DE LAS VECES
             * 
             */

            //Genera variables para almacenar los campos de los embeds
            let expiration = null, executor = null, reason = null;

            //Almacena la caché de registros del usuario silenciao o dessilenciado, si existe
            const loggingCache = (client.loggingCache && client.loggingCache[newMember.id]) ? client.loggingCache[newMember.id] : null;
        
            //Si se trata de una caché de usuario silenciao o dessilenciado
            if (loggingCache && loggingCache.action.includes('mute')) {

                //Si esta incluía vencimiento, lo almacena
                if (loggingCache.expiration) expiration = loggingCache.expiration;

                //Almacena al moderador correcto
                executor = await client.users.fetch(loggingCache.executor);

                //Almacena la razón formateada
                reason = loggingCache.reason;

                //Borra la caché de registros del miembro
                delete client.loggingCache[newMember.id];
            };

            //Si se ha silenciado
            if (newMember.communicationDisabledUntilTimestamp) {

                //Envía un mensaje al canal de registros
                if (client.config.logging.mutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.communicationDisabled.loggingEmbed.author, { memberTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL({dynamic: true}) })
                    .addField(locale.communicationDisabled.loggingEmbed.memberId, newMember.id, true)
                    .addField(locale.communicationDisabled.loggingEmbed.moderator, executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, true)
                    .addField(locale.communicationDisabled.loggingEmbed.reason, reason || locale.communicationDisabled.loggingEmbed.unknownReason, true)
                    .addField(locale.communicationDisabled.loggingEmbed.expiration, expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.communicationDisabled.loggingEmbed.unknownExpiration, true)
                );

                //Envía una notificación al miembro
                await newMember.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: locale.communicationDisabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.communicationDisabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                    .addField(locale.communicationDisabled.privateEmbed.moderator, executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, true)
                    .addField(locale.communicationDisabled.privateEmbed.reason, reason || locale.communicationDisabled.privateEmbed.unknownReason, true)
                    .addField(locale.communicationDisabled.privateEmbed.expiration, expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.communicationDisabled.privateEmbed.unknownExpiration, true)
                ]});

            //Si se ha dessilenciado
            } else {

                //Si el silenciamiento estaba registrado en la base de datos
                if (client.db.mutes[newMember.id]) {

                    //Elimina la entrada de la base de datos
                    delete client.db.mutes[newMember.id];

                    //Sobreescribe el fichero de la base de datos con los cambios
                    await client.fs.writeFile('./storage/databases/mutes.json', JSON.stringify(client.db.mutes), async err => {

                        //Si hubo un error, lo lanza a la consola
                        if (err) throw err;
                    });
                };

                //Envía un mensaje al canal de registros
                if (client.config.logging.unmutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.communicationEnabled.loggingEmbed.author, { userTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL({dynamic: true})})
                    .addField(locale.communicationEnabled.loggingEmbed.memberId, newMember.id.toString(), true)
                    .addField(locale.communicationEnabled.loggingEmbed.moderator, executor ? executor.tag : locale.communicationEnabled.loggingEmbed.unknownModerator, true)
                    .addField(locale.communicationEnabled.loggingEmbed.reason, reason || locale.communicationEnabled.loggingEmbed.unknownReason, true)
                );

                //Envía una notificación al miembro
                await newMember.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: locale.communicationEnabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.communicationEnabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                    .addField(locale.communicationEnabled.privateEmbed.moderator, executor ? executor.tag : locale.communicationEnabled.privateEmbed.unknownModerator, true)
                    .addField(locale.communicationEnabled.privateEmbed.reason, reason || locale.communicationEnabled.privateEmbed.unknownReason, true)
                ]});
            };
        };

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError.run(client, error, 'guildMemberUpdate');
    };
};

export default async (banData, locale) => {

    try {

        //Aborta si no es un evento de la guild registrada
        if (banData.guild.id !== client.baseGuild.id) return;

        //Almacena la caché de registros del usuario baneado, si existe
        const loggingCache = (client.loggingCache && client.loggingCache[banData.user.id]) ? client.loggingCache[banData.user.id] : null;

        //Busca el último baneo en el registro de auditoría
        const fetchedLogs = await banData.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        //Almacena el primer resultado de la búsqueda
        const banLog = fetchedLogs.entries.first();
        
        //Si no hubo registro, o este era inconcluso
        if (!loggingCache && (!banLog || banLog.target.id !== banData.user.id)) {

            //Envía un mensaje al canal de registros
            await client.functions.managers.sendLog('bannedMember', 'embed', new discord.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: await client.functions.utils.parseLocale(locale.inconclusiveLoggingEmbed.author, { userTag: banData.user.tag }), iconURL: banData.user.displayAvatarURL() })
                .addFields(
                    { name: locale.inconclusiveLoggingEmbed.memberId, value: banData.user.id, inline: true },
                    { name: locale.inconclusiveLoggingEmbed.moderator, value: locale.inconclusiveLoggingEmbed.unknownModerator, inline: true },
                    { name: locale.inconclusiveLoggingEmbed.reason, value: locale.inconclusiveLoggingEmbed.unknownReason, inline: true },
                    { name: locale.inconclusiveLoggingEmbed.expiration, value: locale.inconclusiveLoggingEmbed.unknownExpiration, inline: true },
                    { name: locale.inconclusiveLoggingEmbed.deletedDays, value: locale.inconclusiveLoggingEmbed.unknownDeletedDays, inline: true }
                )
            );

        //Si se encontró un baneo en el primer resultado
        } else {

            //Almacena el ejecutor y la razón
            let executor = banLog.executor;
            let reason = banLog.reason;

            //Almacena la expiración del baneo y los días de mensajes borrados
            let expiration, deletedDays;
        
            //Si se trata de una caché de baneo
            if (loggingCache && loggingCache.action.includes('ban')) {

                //Si esta incluía vencimiento, lo almacena
                if (loggingCache.expiration) expiration = loggingCache.expiration;

                //Si esta incluía días de mensajes borrados, los almacena
                if (loggingCache.deletedDays) deletedDays = loggingCache.deletedDays;

                //Almacena al moderador correcto
                executor = await client.users.fetch(loggingCache.executor);

                //Almacena la razón formateada
                reason = loggingCache.reason;

                //Borra la caché de registros del miembro
                delete client.loggingCache[banData.user.id];
            };

            //Si el miembro baneado era un bot
            if (banData.user.bot) {

                //Si el baneo fue al propio bot, ignora
                if (banData.user.id === client.user.id) return;

                //Envía un registro al canal de registros
                await client.functions.managers.sendLog('bannedBot', 'embed', new discord.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                    .setDescription(await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { userTag: banData.user.tag }))
                );
            };

            //Envía un mensaje al canal de registros
            await client.functions.managers.sendLog('bannedMember', 'embed', new discord.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: await client.functions.utils.parseLocale(locale.loggingEmbed.author, { userTag: banData.user.tag }), iconURL: banData.user.displayAvatarURL() })
                .addFields(
                    { name: locale.loggingEmbed.memberId, value: banData.user.id, inline: true },
                    { name: locale.loggingEmbed.moderator, value: executor ? executor.tag : locale.loggingEmbed.unknownModerator, inline: true },
                    { name: locale.loggingEmbed.reason, value: reason ? reason : locale.loggingEmbed.undefinedReason, inline: true },
                    { name: locale.loggingEmbed.expiration, value: expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.loggingEmbed.noExpiration, inline: true },
                    { name: locale.loggingEmbed.deletedDays, value: deletedDays || locale.loggingEmbed.noDeletedDays, inline: true }
                )
            );
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.eventError(error);
    };
};

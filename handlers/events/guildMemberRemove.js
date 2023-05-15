export default async (member, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (member.guild.id !== client.baseGuild.id) return;

        //Almacena la caché de registros del usuario expulsado, si existe
        const loggingCache = (client.loggingCache && client.loggingCache[member.id]) ? client.loggingCache[member.id] : null;
        
        //Busca la última expulsión en el registro de auditoría
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        //Almacena el primer resultado de la búsqueda
        const kickLog = fetchedLogs.entries.first();
        
        //Si se encontró una expulsión en el primer resultado, y han pasado menos de 5 segundos
        if (loggingCache || (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000)))) {

            //Si no hubo registro, o este era inconcluso
            if (kickLog.target.id !== member.id) {

                //Envía un registro al canal de registros
                await client.functions.managers.sendLog('kickedMember', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setAuthor({ name: await client.functions.utils.parseLocale(locale.inconclusiveLoggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.inconclusiveLoggingEmbed.memberId, value: member.id, inline: true },
                        { name: locale.inconclusiveLoggingEmbed.moderator, value: locale.inconclusiveLoggingEmbed.unknownModerator, inline: true },
                        { name: locale.inconclusiveLoggingEmbed.reason, value: locale.inconclusiveLoggingEmbed.unknownReason, inline: true }
                    )
                );
            };
        
            //Si el miembro expulsado era un bot
            if (member.user.bot) {

                //Si la expulsión fue al propio bot, ignora
                if (member.user.id === client.user.id) return;

                //Envía un registro al canal de registros
                await client.functions.managers.sendLog('kickedBot', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                    .setDescription(await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { memberTag: member.user.tag }))
                );
            };

            //Almacena el ejecutor y la razón
            let executor = kickLog.executor;
            let reason = kickLog.reason;

            //Si se detecta que la expulsión fue realizada por el bot
            if (loggingCache && loggingCache.action === 'kick') {

                //Cambia el ejecutor, por el especificado en la razón
                executor = await client.users.fetch(loggingCache.executor);

                //Cambia la razón provista, para contener solo el campo de razón
                reason = loggingCache.reason;

                //Borra la caché de registros del miembro
                loggingCache = null;
            };

            //Envía un registro al canal de registros
            await client.functions.managers.sendLog('kickedMember', 'embed', new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setAuthor({ name: await client.functions.utils.parseLocale(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addFields(
                    { name: locale.loggingEmbed.memberId, value: member.id, inline: true },
                    { name: locale.loggingEmbed.moderator, value: executor ? executor.tag : locale.loggingEmbed.unknownModerator, inline: true },
                    { name: locale.loggingEmbed.reason, value: reason ? reason : locale.loggingEmbed.undefinedReason, inline: true }
                )
            );

        } else { //Si no se encontró una expulsión

            //Busca el último baneo en el registro de auditoría
            const fetchedBans = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            //Almacena el primer resultado de la búsqueda
            const banLog = fetchedBans.entries.first();

            //Si no encontró un baneo en el primer resultado, o han pasado más de 5 segundos desde el último baneo
            if (!banLog || Date.now() > (banLog.createdTimestamp + 5000)) {

                //Envía un registro al canal de bienvenidas/despedidas (por que no se trató ni de una expulsión ni de un baneo)
                await client.functions.managers.sendLog('memberLeaved', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
                    .setAuthor({ name: locale.goodbyeEmbed.author, iconURL: 'attachment://out.png' })
                    .setDescription(await client.functions.utils.parseLocale(locale.goodbyeEmbed.description, { memberTag: member.user.tag }))
                    .addFields(
                        { name: `🆔 ${locale.goodbyeEmbed.memberId}`, value: member.user.id, inline: true },
                        { name: `📆 ${locale.goodbyeEmbed.antiquity}`, value: `\`${await client.functions.utils.msToTime(Date.now() - member.joinedTimestamp)}\``, inline: true }
                ), ['./assets/images/out.png']);
            };
        };

        //Si el miembro tiene estadísticas y no se desea preservarlas
        if (await client.functions.db.getData('profile', member.id) && !await client.functions.db.getConfig('leveling.preserveStats')) {

            //Borra la entrada de la base de datos
            await client.functions.db.delData('profile', member.id);
        };

    } catch (error) {

        //Ignora si fue el propio bot el que fue expulsado
        if (member.user.id === client.user.id) return;

        //Ejecuta el manejador de errores
        await client.functions.managers.eventError(error);
    };
};

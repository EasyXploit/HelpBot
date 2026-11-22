exports.run = async (member,locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (member.guild.id !== client.homeGuild.id) return;

        //Almacena la caché de registros del miembro, si existe
        const loggingCache = (client.loggingCache && client.loggingCache[member.id]) ? client.loggingCache[member.id] : null;

        //Almacena si el bot expulsó al miembro
        const kickedByTheBot = loggingCache && loggingCache.action === 'kick';
        
        //Busca la última expulsión en el registro de auditoría
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        //Almacena el primer resultado de la búsqueda
        const kickLog = fetchedLogs.entries.first();
        
        //Si el bot expulsó al miembro, o se encontró una expulsión en el primer resultado y han pasado menos de 5 segundos
        if (kickedByTheBot || (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000)))) {

            //Si el miembro expulsado era un bot
            if (member.user.bot) {

                //Envía un registro al canal de registros, salvo si la expulsión fue al propio bot
                if (client.config.logging.kickedBot && member.user.id !== client.user.id) await client.functions.managers.logging.run('embed', new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.botLoggingEmbed.description, { memberTag: member.user.tag }))
                );

            //Si el bot expulsó al miembro, o la expulsión del registro de auditoría es la de este miembro
            } else if (kickedByTheBot || kickLog.target.id === member.id) {

                //Almacena el ejecutor y la razón, de la caché de registros si el bot expulsó al miembro, o del registro de auditoría si no
                const executor = kickedByTheBot ? await client.users.fetch(loggingCache.executor) : kickLog.executor;
                const reason = kickedByTheBot ? loggingCache.reason : kickLog.reason;

                //Envía un registro al canal de registros
                if (client.config.logging.kickedMember) await client.functions.managers.logging.run('embed', new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.loggingEmbed.memberId, value: member.id, inline: true },
                        { name: locale.loggingEmbed.moderator, value: executor ? executor.tag : locale.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.loggingEmbed.reason, value: reason ? reason : locale.loggingEmbed.undefinedReason, inline: true }
                    )
                );

            //Si la expulsión del registro de auditoría es la de otro miembro, por lo que no se puede confirmar
            } else {

                //Envía un registro al canal de registros
                if (client.config.logging.kickedMember) await client.functions.managers.logging.run('embed', new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.inconclusiveLoggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.inconclusiveLoggingEmbed.memberId, value: member.id, inline: true },
                        { name: locale.inconclusiveLoggingEmbed.moderator, value: locale.inconclusiveLoggingEmbed.unknownModerator, inline: true },
                        { name: locale.inconclusiveLoggingEmbed.reason, value: locale.inconclusiveLoggingEmbed.unknownReason, inline: true }
                    )
                );
            };

            //Borra la caché de registros del miembro, si el bot lo expulsó
            if (kickedByTheBot) delete client.loggingCache[member.id];

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
                if (client.config.logging.memberLeaved) await client.joinsAndLeavesChannel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
                    .setAuthor({ name: locale.goodbyeEmbed.author, iconURL: 'attachment://out.png' })
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.goodbyeEmbed.description, { memberTag: member.user.tag }))
                    .addFields(
                        { name: `🆔 ${locale.goodbyeEmbed.memberId}`, value: member.user.id, inline: true },
                        { name: `📆 ${locale.goodbyeEmbed.antiquity}`, value: `\`${await client.functions.utilities.msToTime.run(Date.now() - member.joinedTimestamp)}\``, inline: true }
                    )
                ], files: ['./resources/images/out.png'] });
            };
        };

        //Si el miembro tiene estadísticas y no se desea preservarlas
        if (client.db.stats[member.id] && !client.config.leveling.preserveStats) {

            //Borra la entrada de la base de datos
            delete client.db.stats[member.id];

            //Sobreescribe el fichero de la base de datos con los cambios
            client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;
            });
        };

    } catch (error) {

        //Ignora si fue el propio bot el que fue expulsado
        if (member.user.id === client.user.id) return;

        //Ejecuta el manejador de errores
        await client.functions.managers.eventError.run(error);
    };
};

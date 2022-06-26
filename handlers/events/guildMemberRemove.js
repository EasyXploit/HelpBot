exports.run = async (member, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (member.guild.id !== client.homeGuild.id) return;
        
        //Busca la última expulsión en el registro de auditoría
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        //Almacena el primer resultado de la búsqueda
        const kickLog = fetchedLogs.entries.first();
        
        //Si se encontró una expulsión en el primer resultado, y han pasado menos de 5 segundos
        if (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000))) {
        
            //Si el miembro expulsado era un bot
            if (member.user.bot) {

                //Si la expulsión fue al propio bot, ignora
                if (member.user.id === client.user.id) return;
                
                //Envía un registro al canal de registros
                return await client.channels.cache.get(client.config.main.loggingChannel).send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                    .setDescription(client.functions.localeParser(locale.botLoggingEmbed.description, { memberTag: member.user.tag }))
                ]});
            };

            //Almacena el ejecutor y la razón
            let { executor, reason } = kickLog;

            //Si se detecta que la expulsión fue realizada por el bot
            if (client.loggingCache && client.loggingCache[member.id] && client.loggingCache[member.id].action === 'kick') {

                //Cambia el ejecutor, por el especificado en la razón
                executor = await client.users.fetch(client.loggingCache[member.id].executor);

                //Cambia la razón provista, para contener solo el campo de razón
                reason = client.loggingCache[member.id].reason;

                //Borra la caché de registros del miembro
                delete client.loggingCache[member.id];
            };

            //Envía un registro al canal de registros
            await client.channels.cache.get(client.config.main.loggingChannel).send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: client.functions.localeParser(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(locale.loggingEmbed.memberId, member.id, true)
                .addField(locale.loggingEmbed.moderator, executor ? executor.tag : locale.loggingEmbed.unknownModerator, true)
                .addField(locale.loggingEmbed.reason, reason ? reason : locale.loggingEmbed.undefinedReason, true)
            ]});

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
                await client.channels.cache.get(client.config.main.joinsAndLeavesChannel).send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
                    .setAuthor({ name: locale.goodbyeEmbed.author, iconURL: 'attachment://out.png' })
                    .setDescription(client.functions.localeParser(locale.goodbyeEmbed.description, { memberTag: member.user.tag }))
                    .addField(`🆔 ${locale.goodbyeEmbed.memberId}`, member.user.id, true)     
                    .addField(`📆 ${locale.goodbyeEmbed.antiquity}`, `\`${client.functions.msToTime(Date.now() - member.joinedTimestamp)}\``, true)
                ], files: ['./resources/images/out.png'] });
            };
        };

        //Si el miembro tiene estadísticas y no se desea preservarlas
        if (client.db.stats[member.id] && !client.config.xp.preserveStats) {

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
        await client.functions.eventErrorHandler(error, 'guildMemberRemove');
    };
};

exports.run = async (banData, client) => {

    try {

        //Busca el último baneo en el registro de auditoría
        const fetchedLogs = await banData.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        //Almacena el primer resultado de la búsqueda
        const banLog = fetchedLogs.entries.first();

        //Si se encontró un baneo en el primer resultado
        if (banLog) {

            //Almacena el ejecutor y la razón
            let { executor, reason } = banLog;

            //Almacena la expiración del baneo y los días de mensajes borrados
            let expiration, deletedDays;

            //Almacena la caché de registros del usuario baneado, si existe
            const loggingCache = (client.loggingCache && client.loggingCache[banData.user.id]) ? client.loggingCache[banData.user.id] : null;
        
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
                return await client.channels.cache.get(client.config.main.loggingChannel).send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle('📑 Registro - [BOTS]')
                    .setDescription(`El **BOT** <@${banData.user.tag}> fue baneado del servidor.`)
                ]});
            };

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: `${banData.user.tag} ha sido BANEADO`, iconURL: banData.user.displayAvatarURL({dynamic: true}) })
                .addField('ID del miembro', banData.user.id, true)
                .addField('Moderador', executor ? executor.tag : 'Desconocido', true)
                .addField('Razón', reason ? reason : 'Indefinida', true)
                .addField('Vencimiento', expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : 'No vence', true)
                .addField('Días de mensajes borrados', deletedDays || 'Ninguno', true)
            );
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.eventErrorHandler(error, 'guildBanAdd');
    };
};

//Función para manejar las infracciones generadas
exports.run = async (client, member, reason, action, moderator, message, interaction, channel, filteredURL) => {

    try {

        //Almacena las traducciones
        const locale = client.locale.functions.moderation.manageWarn;

        //Función para silenciar
        async function timeout(duration) {

            //Almacena la anterior expiración del silenciamiento
            const oldExpiration = client.db.timeouts[member.id] ? client.db.timeouts[member.id].until : null;

            //Almacena el silenciamiento en la BD
            client.db.timeouts[member.id] = {
                until: Date.now() + duration,
                moderator: client.user.id
            };

            //Si no hay caché de registros
            if (!client.loggingCache) client.loggingCache = {};

            //Crea una nueva entrada en la caché de registros
            client.loggingCache[member.id] = {
                action: 'timeout',
                executor: member.id,
                reason: locale.timeoutFunction.reason
            };

            //Sobreescribe el fichero de BD
            client.fs.writeFile('./storage/databases/timeouts.json', JSON.stringify(client.db.timeouts, null, 4), async err => {

                //Si hubo algún error, lo lanza por consola
                if (err) throw err;

                //Deshabilita la comunicación del miembro en el servidor
                await member.disableCommunicationUntil((Date.now() + duration), locale.timeoutFunction.reason);
            });

            //Envía un mensaje al canal de la infracción
            if (channel.type !== 'DM') await channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(oldExpiration ? locale.timeoutFunction.notificationEmbed.extended : locale.timeoutFunction.notificationEmbed.initiated, { memberTag: member.user.tag })}`)
            ]});
        };

        //Función para expulsar
        async function kick() {

            //Envía un mensaje al canal de la infracción
            if (channel.type !== 'DM') await channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.kickFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.secondaryError')}`)
                .setAuthor({ name: locale.kickFunction.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.kickFunction.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                .addFields(
                    { name: locale.kickFunction.privateEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.kickFunction.privateEmbed.reason, value: locale.kickFunction.reason, inline: true }
                )
            ]});

            //Expulsa al miembro
            await member.kick(reason);
        };

        //Función para banear
        async function ban(duration) {

            //Si se especificó una duración limitada
            if (duration) {

                //Almacena el baneo en la BD
                client.db.bans[member.id] = {
                    until: Date.now() + duration
                };
        
                //Sobreescribe el fichero de BD
                client.fs.writeFile('./storage/databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

                    //Si hubo algún error, lo lanza por consola
                    if (err) throw err;
                });
            };

            //Si no hay caché de registros
            if (!client.loggingCache) client.loggingCache = {};

            //Crea una nueva entrada en la caché de registros
            client.loggingCache[member.id] = {
                action: duration ? 'tempban' : 'ban',
                executor: client.user.id,
                reason: locale.banFunction.reason
            };

            //Si se especificó expiración, la almacena el la caché
            if (duration) client.loggingCache[member.id].until = Date.now() + duration;

            //Envía un mensaje al canal de la infracción
            if (channel.type !== 'DM') await channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.banFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.secondaryError')}`)
                .setAuthor({ name: locale.banFunction.privateEmbed.author, iconURL: client.baseGuild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.banFunction.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                .addFields(
                    { name: locale.banFunction.privateEmbed.moderator, value: moderator.tag, inline: true },
                    { name: locale.banFunction.privateEmbed.reason, value: locale.banFunction.reason, inline: true },
                    { name: locale.banFunction.privateEmbed.expiration, value: duration ? `<t:${Math.round(new Date(parseInt(Date.now() + duration)) / 1000)}:R>` : locale.banFunction.privateEmbed.noExpiration, inline: true }
                )
            ]});

            //Banea al miembro
            await client.baseGuild.members.ban(member.user, {reason: locale.banFunction.reason });
        };

        //Capitaliza la razón de la advertencia
        const warnReason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        try {

            //Envía un mensaje de advertencia al miembro por MD
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                .setAuthor({ name: locale.warn.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.warn.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                .addFields(
                    { name: locale.warn.privateEmbed.moderator, value: moderator.tag, inline: true },
                    { name: locale.warn.privateEmbed.reason, value: warnReason, inline: true }
                )
            ]});

        } catch (error) {

            //Maneja si un miembro no admite mensajes directos del bot (por la razón que sea)
            if (error.toString().includes('Cannot send messages to this user')) null;
        };

        //Si se trata de un canal que no es de DM
        if (channel.type !== 'DM') {

            //Si se trata de una interacción
            if (interaction) {

                //Responde a la interacción con la advertencia
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                    .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});

            } else {

                //Envía un mensaje con la advertencia
                if (channel.type !== 'DM') await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                    .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});
            };
        };

        //Borra el mensaje si se ha de hacer
        if (action === 1 || action === 3) if (message.deletable) message.delete();

        //Advierte si se ha de hacer
        if (action === 2 || action === 3) {

            //Añade una nueva tabla de infracciones para el miembro
            if (!client.db.warns[member.id]) client.db.warns[member.id] = {};

            //Genera un ID para la infracción
            const warnID = await client.functions.utilities.generateSid.run();
            
            //Graba la infracción en la base de datos
            client.db.warns[member.id][warnID] = {
                timestamp: Date.now(),
                reason: warnReason,
                moderator: moderator.id
            };

            //Sobreescribe la base de datos con los nuevos datos
            client.fs.writeFile('./storage/databases/warns.json', JSON.stringify(client.db.warns, null, 4), async err => {

                //Si ocurrió un error, lo lanza a la consola
                if (err) throw err;

                //Ejecuta el manejador de registro
                await client.functions.managers.logging.run(client, 'warnedMember', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig.run('colors.warning')}`)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.warn.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.warn.loggingEmbed.memberId, value: member.id, inline: true },
                        { name: locale.warn.loggingEmbed.moderator, value: moderator.tag, inline: true },
                        { name: locale.warn.loggingEmbed.reason, value: warnReason, inline: true },
                        { name: locale.warn.loggingEmbed.warnId, value: warnID, inline: true },
                        { name: locale.warn.loggingEmbed.channel, value: `${channel}`, inline: true },
                        { name: locale.warn.loggingEmbed.infractions, value: (Object.keys(client.db.warns[member.id]).length).toString(), inline: true }
                    )
                );

                //Si procede, adjunta el mensaje filtrado
                if (message && await client.functions.db.getConfig.run('moderation.attachFilteredMessages')) await client.functions.managers.logging.run(client, 'warnedMember', 'file', new client.MessageAttachment(Buffer.from(filteredURL || message.content, 'utf-8'), `filtered-${Date.now()}.txt`));
            });

            //Banea temporalmente a los miembros que se acaban de unir al servidor y han mandado invitaciones
            if (message && channel.type === 'DM' && (member.joinedTimestamp + await client.functions.db.getConfig.run('moderation.newMemberTimeDelimiter')) < Date.now()) {

                //Ejecuta la función de baneo
                return ban(await client.functions.db.getConfig.run('moderation.newSpammerMemberBanDuration'));
            };

            //Función para comparar un array
            function compare(a, b) {
                if (a.quantity < b.quantity) return 1;
                if (a.quantity > b.quantity) return -1;
                return 0;
            };

            //Compara y ordena el array de recompensas
            const automodRules = await client.functions.db.getConfig.run('moderation.automodRules')
            const sortedRules = automodRules.sort(compare);

            //Por cada una de las reglas de automoderación
            for (const rule of sortedRules) {

                //Almacena el conteo de infracciones
                let warnsCount = 0;

                //Por cada una de las infracciones del miembro
                Object.keys(client.db.warns[member.id]).forEach(entry => {

                    //Si no este supera el umbral de edad de la regla, lo añade al recuento
                    if (Date.now() - client.db.warns[member.id][entry].timestamp <= rule.age) warnsCount++;
                });

                //Si se iguala o excede la cantidad máxima de la regla
                if (warnsCount >= rule.quantity) {

                    //Ejecuta la acción de moderación que corresponda
                    switch (rule.action) {
                        case 'timeout':        timeout(rule.duration);    break;
                        case 'kick':        kick();                 break;
                        case 'tempban':     ban(rule.duration);     break;
                        case 'ban':         ban();                  break;
                    };

                    //Aborta en cuanto se haya ejecutado
                    break;
                };
            };
        };
        
    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

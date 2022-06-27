//Función para manejar las infracciones generadas
exports.run = async (client, member, reason, action, moderator, message, interaction, channel) => {

    try {

        //Almacena las traducciones
        const locale = client.locale.functions.moderation.manageWarn;

        //Función para silenciar
        async function mute(duration) {

            //Comprueba si existe el rol silenciado, sino lo crea
            const mutedRole = await client.functions.moderation.checkMutedRole.run(client, client.homeGuild);

            //Si el miembro no estaba silenciado
            if (!member.roles.cache.has(mutedRole.id)) {

                //Añade el rol silenciado al miembro 
                member.roles.add(mutedRole);

                //Propaga el rol silenciado por todos los canales
                await client.functions.moderation.spreadMutedRole(client.homeGuild);
            };

            //Almacena la anterior duración del silenciamiento
            const oldDuration = client.db.mutes[member.id] ? client.db.mutes[member.id].until : null;

            //Almacena el silenciamiento en la BD
            client.db.mutes[member.id] = {
                until: duration ? Date.now() + duration : null,
                moderator: client.user.id
            };

            //Sobreescribe el fichero de BD
            client.fs.writeFile('./storage/databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

                //Si hubo algún error, lo lanza por consola
                if (err) throw err;
            });

            //Si ya estaba silenciado indefinidamente, no lo notifica
            if (member.roles.cache.has(mutedRole.id) && !oldDuration && !duration) return;

            //Envía un mensaje al canal de registro
            await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.muteFunction.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(locale.muteFunction.loggingEmbed.memberId, member.id, true)
                .addField(locale.muteFunction.loggingEmbed.moderator, `${client.user}`, true)
                .addField(locale.muteFunction.loggingEmbed.reason, locale.muteFunction.reason, true)
                .addField(locale.muteFunction.loggingEmbed.expiration, duration ? `<t:${Math.round(new Date(parseInt(Date.now() + duration)) / 1000)}:R>` : locale.muteFunction.loggingEmbed.noExpiration, true)
            );

            //Envía un mensaje al canal de la infracción
            await channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.muteFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: locale.muteFunction.privateEmbed.author, iconURL: client.homeGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.muteFunction.privateEmbed.description, { member: member, guildName: client.homeGuild.name }))
                .addField(locale.muteFunction.privateEmbed.moderator, `${client.user}`, true)
                .addField(locale.muteFunction.privateEmbed.reason, locale.muteFunction.reason, true)
                .addField(locale.muteFunction.privateEmbed.expiration, duration ? `<t:${Math.round(new Date(parseInt(Date.now() + duration)) / 1000)}:R>` : locale.muteFunction.privateEmbed.noExpiration, true)
            ]});
        };

        //Función para expulsar
        async function kick() {

            //Envía un mensaje al canal de la infracción
            await channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.kickFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: locale.kickFunction.privateEmbed.author, iconURL: client.homeGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.kickFunction.privateEmbed.description, { member: member, guildName: client.homeGuild.name }))
                .addField(locale.kickFunction.privateEmbed.moderator, `${client.user}`, true)
                .addField(locale.kickFunction.privateEmbed.reason, locale.kickFunction.reason, true)
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
            await channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.banFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: locale.banFunction.privateEmbed.author, iconURL: client.homeGuild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.banFunction.privateEmbed.description, { member: member, guildName: client.homeGuild.name }))
                .addField(locale.banFunction.privateEmbed.moderator, moderator.tag, true)
                .addField(locale.banFunction.privateEmbed.reason, locale.banFunction.reason, true)
                .addField(locale.banFunction.privateEmbed.expiration, duration ? `<t:${Math.round(new Date(parseInt(Date.now() + duration)) / 1000)}:R>` : locale.banFunction.privateEmbed.noExpiration, true)
            ]});

            //Banea al miembro
            await client.homeGuild.members.ban(member.user, {reason: locale.banFunction.reason });
        };

        //Capitaliza la razón de la advertencia
        const warnReason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        try {

            //Envía un mensaje de advertencia al miembro por MD
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setAuthor({ name: locale.warn.privateEmbed.author, iconURL: client.homeGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.warn.privateEmbed.description, { member: member, guildName: client.homeGuild.name }))
                .addField(locale.warn.privateEmbed.moderator, moderator.tag, true)
                .addField(locale.warn.privateEmbed.reason, warnReason, true)
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
                    .setColor(client.config.colors.warning)
                    .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utilities.parseLocale.run(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});

            } else {

                //Envía un mensaje con la advertencia
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
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
                await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.warn.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addField(locale.warn.loggingEmbed.memberId, member.id, true)
                    .addField(locale.warn.loggingEmbed.moderator, moderator.tag, true)
                    .addField(locale.warn.loggingEmbed.reason, warnReason, true)
                    .addField(locale.warn.loggingEmbed.warnId, warnID, true)
                    .addField(locale.warn.loggingEmbed.channel, `${channel}`, true)
                    .addField(locale.warn.loggingEmbed.infractions, (Object.keys(client.db.warns[member.id]).length).toString(), true)
                );

                //Si procede, adjunta el mensaje filtrado
                if (message && client.config.moderation.attachFilteredMessages) await client.functions.managers.logging.run(client, 'file', new client.MessageAttachment(Buffer.from(message.content, 'utf-8'), `filtered-${Date.now()}.txt`));
            });

            //Banea temporalmente a los miembros que se acaban de unir al servidor y han mandado invitaciones
            if (message && channel.type === 'DM' && (member.joinedTimestamp + client.config.moderation.newMemberTimeDelimiter) < Date.now()) {

                //Ejecuta la función de baneo
                return ban(client.config.moderation.newSpammerMemberBanDuration);
            };

            //Función para comparar un array
            function compare(a, b) {
                if (a.quantity < b.quantity) return 1;
                if (a.quantity > b.quantity) return -1;
                return 0;
            };

            //Compara y ordena el array de recompensas
            const automodRules = client.config.automodRules.sort(compare);

            //Por cada una de las reglas de automoderación
            for (const rule of automodRules) {

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
                        case 'tempmute':    mute(rule.duration);    break;
                        case 'mute':        mute();                 break;
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
        console.error(`${new Date().toLocaleString()} 》${client.locale.functions.moderation.manageWarn.error}:`, error.stack);
    };
};

//Función para manejar las infracciones generadas
export default async (member, reason, action, moderator, message, interaction, channel, filteredURL) => {

    try {

        //Almacena las traducciones
        const locale = client.locale.functions.moderation.manageWarn;

        //Función para silenciar
        async function timeout(duration) {

            //Almacena el timeout del miembro, si tiene
            const memberTimeout = await client.functions.db.getData('timeout', member.id);

            //Almacena la anterior expiración del aislamiento
            const oldExpiration = memberTimeout ? memberTimeout.untilTimestamp : null;

            //Almacena el aislamiento en la BD
            await client.functions.db.genData('timeout', {
                userId: member.id,
                moderatorId: client.user.id,
                untilTimestamp: Date.now() + duration
            });

            //Si no hay caché de registros
            if (!client.loggingCache) client.loggingCache = {};

            //Crea una nueva entrada en la caché de registros
            client.loggingCache[member.id] = {
                action: 'timeout',
                executor: client.user.id,
                reason: locale.timeoutFunction.reason
            };

            //Almacena si el bot tiene permiso para aislar temporalmente
            const missingPermission = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ModerateMembers']);

            //Envía un mensaje a la consola si el bot no tenía permiso para aislar
            if (missingPermission) return logger.warn(`The bot was not allowed to temporarily isolate ${member.user.tag} (${member.id}) during the auto-moderation cycle`);
            
            //Deshabilita la comunicación del miembro en el servidor
            await member.disableCommunicationUntil((Date.now() + duration), locale.timeoutFunction.reason);

            //Envía un mensaje al canal de la infracción
            if (channel.type !== discord.ChannelType.DM) await channel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(oldExpiration ? locale.timeoutFunction.notificationEmbed.extended : locale.timeoutFunction.notificationEmbed.initiated, { memberTag: member.user.tag })}`)
            ]});
        };

        //Función para expulsar
        async function kick() {

            //Almacena si el bot tiene permiso para expulsar
            const missingPermission = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['KickMembers']);

            //Envía un mensaje a la consola si el bot no tenía permiso para expulsar
            if (missingPermission) return logger.warn(`The bot was not allowed to kick ${member.user.tag} (${member.id}) during the auto-moderation cycle`);

            //Envía un mensaje al canal de la infracción
            if (channel.type !== discord.ChannelType.DM) await channel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.kickFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: locale.kickFunction.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.kickFunction.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
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

            //Almacena si el bot tiene permiso para banear
            const missingPermission = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['BanMembers']);

            //Envía un mensaje a la consola si el bot no tenía permiso para banear
            if (missingPermission) return logger.warn(`The bot was not allowed to ban ${member.user.tag} (${member.id}) during the auto-moderation cycle`);

            //Si se especificó una duración limitada
            if (duration) {

                //Almacena el baneo en la BD
                await client.functions.db.genData('ban', {
                    userId: member.id,
                    moderatorId: client.user.id,
                    untilTimestamp: Date.now() + duration
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
            if (channel.type !== discord.ChannelType.DM) await channel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.banFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: locale.banFunction.privateEmbed.author, iconURL: client.baseGuild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.banFunction.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
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
            await member.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setAuthor({ name: locale.warn.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.warn.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
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
        if (channel.type !== discord.ChannelType.DM) {

            //Almacena si el bot tiene permiso para usar emojis externos en el canal de la advertencia
            const missingExtEmojisPermissions = interaction || channel.type !== discord.ChannelType.DM ? await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['UseExternalEmojis']) : false;

            //Envía una advertencia a la consola si falta el permiso de usar emojis externos
            if (missingExtEmojisPermissions) logger.warn(`The bot does not have permission to use external emojis in the channel ${channel.name} (${channel.id}), so the warns will not be in the expected format`);

            //Si se trata de una interacción
            if (interaction) {

                //Responde a la interacción con la advertencia
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setDescription(`${missingExtEmojisPermissions ? '' : client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});

            } else {

                //Envía un mensaje con la advertencia
                if (channel.type !== discord.ChannelType.DM) await message.channel.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setDescription(`${missingExtEmojisPermissions ? '' : client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});
            };
        };

        //Borra el mensaje si se ha de hacer (y notifica si no es posible)
        if (action === 1 || action === 3) if (message.deletable) message.delete();
        else if (message.channel.type !== discord.ChannelType.DM) logger.warn(`The bot does not have permission to delete the message with ID ${message.id} from ${message.author.tag} (${message.author.id}) on ${message.channel.name} (${message.channel.id})`);

        //Advierte si se ha de hacer
        if (action === 2 || action === 3) {

            //Almacena el perfil del miembro, o lo crea
            let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });

            //Almacena las advertencias del miembro
            let memberWarns = memberProfile.moderationLog.warnsHistory;

            //Genera un Id para la infracción
            const warnId = await client.functions.utils.generateSid();

            //Genera un array para almacenar el contenido filtrado
            let filteredContent = [];

            //Si se advirtió un mensaje y tenía contenido, lo almacena
            if (message && message.content) filteredContent.push(message.content);

            //Si se advirtió un mensaje y tenía adjuntos
            if (message && message.attachments.size > 0) {

                //Obtiene un array con los adjuntos del mensaje filtrado
                const attachmentsArray = Array.from(message.attachments.values());

                //Sube la URL de cada adjunto  al array de contenido filtrado
                for (const attachment of attachmentsArray) filteredContent.push(attachment.url);
            };

            //Añade la advertencia a la lista
            memberWarns.push({
                warnId: warnId,
                timestamp: Date.now(),
                reason: warnReason,
                content: filteredContent.length > 0 ? filteredContent : null,
                executor: {
                    type: client.user.id === moderator.id ? 'bot' : 'member',
                    memberId: moderator.id
                }
            });
            
            //Graba la advertencia en la base de datos
            await client.functions.db.setData('profile', member.id, memberProfile);

            //Ejecuta el manejador de registro
            await client.functions.managers.sendLog('warnedMember', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setAuthor({ name: await client.functions.utils.parseLocale(locale.warn.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL() })
                .addFields(
                    { name: locale.warn.loggingEmbed.memberId, value: member.id, inline: true },
                    { name: locale.warn.loggingEmbed.moderator, value: moderator.tag, inline: true },
                    { name: locale.warn.loggingEmbed.reason, value: warnReason, inline: true },
                    { name: locale.warn.loggingEmbed.warnId, value: warnId, inline: true },
                    { name: locale.warn.loggingEmbed.channel, value: `${channel}`, inline: true },
                    { name: locale.warn.loggingEmbed.infractions, value: (memberWarns.length).toString(), inline: true }
                )
            );

            //Si procede, adjunta el mensaje filtrado
            if (message && await client.functions.db.getConfig('moderation.attachFilteredMessages')) await client.functions.managers.sendLog('warnedMember', 'file', new discord.AttachmentBuilder(Buffer.from(filteredURL || message.content, 'utf-8'), { name: `filtered-${Date.now()}.txt` }));

            //Banea temporalmente a los miembros que se acaban de unir al servidor y han incumplido las normas
            if (message && channel.type === discord.ChannelType.DM && (member.joinedTimestamp + await client.functions.db.getConfig('moderation.newMemberTimeDelimiter')) < Date.now()) {

                //Ejecuta la función de baneo
                return ban(await client.functions.db.getConfig('moderation.newInfractorBanDuration'));
            };

            //Función para comparar un array
            function compare(a, b) {
                if (a.quantity < b.quantity) return 1;
                if (a.quantity > b.quantity) return -1;
                return 0;
            };

            //Compara y ordena el array de recompensas
            const automodRules = await client.functions.db.getConfig('moderation.automodRules')
            const sortedRules = automodRules.sort(compare);

            //Por cada una de las reglas de automoderación
            for (const rule of sortedRules) {

                //Almacena el conteo de infracciones
                let warnsCount = 0;

                //Por cada una de las infracciones del miembro
                for (const entry of memberWarns) {

                    //Si no este supera el umbral de edad de la regla, lo añade al recuento
                    if (Date.now() - entry.timestamp <= rule.age) warnsCount++;
                };

                //Si se iguala o excede la cantidad máxima de la regla
                if (warnsCount >= rule.quantity) {

                    //Ejecuta la acción de moderación que corresponda
                    switch (rule.action) {
                        case 'timeout':     timeout(rule.duration); break;
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

// Exports the event management function
export default async (banData, locale) => {

    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (banData.guild.id !== client.baseGuild.id) return;

        // Stores the cache of records of the banned user, if it exists
        const loggingCache = (client.loggingCache && client.loggingCache[banData.user.id]) ? client.loggingCache[banData.user.id] : null;

        // Looks for the last ban in the audit registry
        const fetchedLogs = await banData.guild.fetchAuditLogs({
            limit: 1,
            type: discord.AuditLogEvent.MemberBanAdd,
        });

        // Stores the first search result
        const banLog = fetchedLogs.entries.first();
        
        // If there was no record, or this was inconclusive
        if (!loggingCache && (!banLog || banLog.target.id !== banData.user.id)) {

            // Sends a message to the records channel
            await client.functions.managers.sendLog('bannedMember', 'embed', new discord.EmbedBuilder()
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

        // If a ban was found in the first result
        } else {

            // Stores the executor and the reason
            let executor = banLog.executor;
            let reason = banLog.reason;

            // Stores the expiration of the ban and the days of erased messages
            let expiration, deletedDays;
        
            // If it's a ban cache
            if (loggingCache && loggingCache.action.includes('ban')) {

                // If this included expiration, it stores it
                if (loggingCache.expiration) expiration = loggingCache.expiration;

                // If this included erased messages, stores them
                if (loggingCache.deletedDays) deletedDays = loggingCache.deletedDays;

                // Stores the correct moderator
                executor = await client.users.fetch(loggingCache.executor);

                // Stores the formatted reason
                reason = loggingCache.reason;

                // Deletes the member's records cache
                delete client.loggingCache[banData.user.id];
            };

            // If the banned member was a bot
            if (banData.user.bot) {

                // If the ban went to the bot himself, ignores
                if (banData.user.id === client.user.id) return;

                // Sends a record to the records channel
                await client.functions.managers.sendLog('bannedBot', 'embed', new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                    .setDescription(await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { userTag: banData.user.tag }))
                );
            };

            // Sends a message to the records channel
            await client.functions.managers.sendLog('bannedMember', 'embed', new discord.EmbedBuilder()
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

        // Executes the error handler
        await client.functions.managers.eventError(error);
    };
};

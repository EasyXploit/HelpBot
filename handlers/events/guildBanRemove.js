// Exports the event management function
export default async (banData, locale) => {

    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (banData.guild.id !== client.baseGuild.id) return;

        // If the ban was temporary, deletes its database entry, so it does not expire later
        if (await client.functions.db.getData('ban', banData.user.id)) await client.functions.db.delData('ban', banData.user.id);

        // Stores the cache of records of the unbanned user, if it exists
        const loggingCache = (client.loggingCache && client.loggingCache[banData.user.id]) ? client.loggingCache[banData.user.id] : null;

        // Generates variables to store the executor and the reason
        let executor = null, reason = null;

        // If the bot unbanned the user
        if (loggingCache && loggingCache.action === 'unban') {

            // Stores the executor and the reason from the records cache
            executor = await client.users.fetch(loggingCache.executor);
            reason = loggingCache.reason;

            // Deletes the user's records cache
            delete client.loggingCache[banData.user.id];

        // If the bot can read the audit registry
        } else if (!await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ViewAuditLog'])) {

            // Looks for the last unban in the audit registry
            const fetchedLogs = await banData.guild.fetchAuditLogs({
                limit: 1,
                type: discord.AuditLogEvent.MemberBanRemove,
            });

            // Stores the first search result
            const unbanLog = fetchedLogs.entries.first();

            // If an unban of the user was found in the first result, and less than 5 seconds have passed
            if (unbanLog && unbanLog.target.id === banData.user.id && unbanLog.createdTimestamp > (Date.now() - 5000)) {

                // Stores the executor and the reason
                executor = unbanLog.executor;
                reason = unbanLog.reason;
            };
        };

        // Sends a record to the records channel
        await client.functions.managers.sendLog('unbannedMember', 'embed', new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setAuthor({ name: await client.functions.utils.parseLocale(locale.loggingEmbed.author, { userTag: banData.user.tag }), iconURL: banData.user.displayAvatarURL() })
            .addFields(
                { name: locale.loggingEmbed.userId, value: banData.user.id, inline: true },
                { name: locale.loggingEmbed.moderator, value: executor ? executor.tag : locale.loggingEmbed.unknownModerator, inline: true },
                { name: locale.loggingEmbed.reason, value: reason || locale.loggingEmbed.undefinedReason, inline: true }
            )
        );

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.eventError(error);
    };
};

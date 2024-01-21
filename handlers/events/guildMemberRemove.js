// Exports the event management function
export default async (member, locale) => {
    
    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (member.guild.id !== client.baseGuild.id) return;

        // Stores the moderation module status
        const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

        // If the moderation module is enabled
        if (moderationModuleEnabled) {

            // Stores the records cache of the kicked user, if it exists
            let loggingCache = (client.loggingCache && client.loggingCache[member.id]) ? client.loggingCache[member.id] : null;
            
            // Looks for the last kick in the audit registry
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: discord.AuditLogEvent.MemberKick,
            });

            // Stores the first search result
            const kickLog = fetchedLogs.entries.first();
            
            // If a kick log was found in the first result, and less than 5 seconds have passed
            if (loggingCache || (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000)))) {

                // If there was no record, or this was inconclusive
                if (kickLog.target.id !== member.id) {

                    // Sends a record to the records channel
                    await client.functions.managers.sendLog('kickedMember', 'embed', new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                        .setAuthor({ name: await client.functions.utils.parseLocale(locale.inconclusiveLoggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL() })
                        .addFields(
                            { name: locale.inconclusiveLoggingEmbed.memberId, value: member.id, inline: true },
                            { name: locale.inconclusiveLoggingEmbed.moderator, value: locale.inconclusiveLoggingEmbed.unknownModerator, inline: true },
                            { name: locale.inconclusiveLoggingEmbed.reason, value: locale.inconclusiveLoggingEmbed.unknownReason, inline: true }
                        )
                    );
                };
            
                // If the kicked member was a bot
                if (member.user.bot) {

                    // If the kick went to the bot himself, ignores
                    if (member.user.id === client.user.id) return;

                    // Sends a record to the records channel
                    await client.functions.managers.sendLog('kickedBot', 'embed', new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                        .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                        .setDescription(await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { memberTag: member.user.tag }))
                    );
                };

                // Stores the executor and the reason
                let executor = kickLog.executor;
                let reason = kickLog.reason;

                // If it is detected that the kick was made by the bot
                if (loggingCache && loggingCache.action === 'kick') {

                    // Changes the executor, by the specified in the reason
                    executor = await client.users.fetch(loggingCache.executor);

                    // Changes the reason provided, to contain only the field of the reason
                    reason = loggingCache.reason;

                    // Deletes the member's records cache
                    loggingCache = null;
                };

                // Sends a record to the records channel
                await client.functions.managers.sendLog('kickedMember', 'embed', new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setAuthor({ name: await client.functions.utils.parseLocale(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL() })
                    .addFields(
                        { name: locale.loggingEmbed.memberId, value: member.id, inline: true },
                        { name: locale.loggingEmbed.moderator, value: executor ? executor.tag : locale.loggingEmbed.unknownModerator, inline: true },
                        { name: locale.loggingEmbed.reason, value: reason ? reason : locale.loggingEmbed.undefinedReason, inline: true }
                    )
                );

            } else { // If a kick was not found

                // Looks for the last ban in the audit registry
                const fetchedBans = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: discord.AuditLogEvent.MemberBanAdd,
                });

                // Stores the first search result
                const banLog = fetchedBans.entries.first();

                // If  a ban was not found in the first result, or more than 5 seconds have passed since the last ban
                if (!banLog || Date.now() > (banLog.createdTimestamp + 5000)) {

                    // Sends a record to the welcome/farewell channel (because it was neither a kick nor a ban)
                    await client.functions.managers.sendLog('memberLeaved', 'embed', new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                        .setThumbnail(member.user.displayAvatarURL())
                        .setAuthor({ name: locale.goodbyeEmbed.author, iconURL: 'attachment://out.png' })
                        .setDescription(await client.functions.utils.parseLocale(locale.goodbyeEmbed.description, { memberTag: member.user.tag }))
                        .addFields(
                            { name: `🆔 ${locale.goodbyeEmbed.memberId}`, value: member.user.id, inline: true },
                            { name: `📆 ${locale.goodbyeEmbed.antiquity}`, value: `\`${await client.functions.utils.msToTime(Date.now() - member.joinedTimestamp)}\``, inline: true }
                    ), ['./assets/images/out.png']);
                };
            };
        };

        // If the member has statistics and don't want to preserve them
        if (await client.functions.db.getData('profile', member.id) && !await client.functions.db.getConfig('leveling.preserveStats')) {

            // Deletes the database entry
            await client.functions.db.delData('profile', member.id);
        };

    } catch (error) {

        // Ignores if it was the bot himself who was kicked
        if (member.user.id === client.user.id) return;

        // Executes the error handler
        await client.functions.managers.eventError(error);
    };
};

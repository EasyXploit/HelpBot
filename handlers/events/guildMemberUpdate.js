// Exports the event management function
export default async (oldMember, newMember, locale) => {
    
    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (oldMember.guild.id !== client.baseGuild.id) return;

        // If the member has passed the verification screen
        if (oldMember.pending && !newMember.pending) {

            // Stores the greetings module status
            const greetingsModuleEnabled = await client.functions.db.getConfig('system.modules.greetings');

            // If the greetings module is enabled
            if (greetingsModuleEnabled) {

                // Stores the member's profile, if it exists
                let memberProfile = await client.functions.db.getData('profile', oldMember.id);
    
                // If the member has an entry in the statistics table, assigns the rewards that corresponds to it
                if (memberProfile && await client.functions.db.getConfig('leveling.preserveStats')) await client.functions.leveling.assignRewards(newMember, memberProfile.stats.level);
            };

            // Stores the new members management mode
            const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');

            // Executes the new members manager (if applicable)
            if (newMemberMode === 1) await client.functions.managers.newMember(newMember);
        };

        // Stores the moderation module status
        const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

        // If the moderation module is enabled
        if (moderationModuleEnabled) {

            // If the member has been timeouted or untimeouted
            if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {

                // Stores the timeout expiration
                let expiration = newMember.communicationDisabledUntilTimestamp;
                
                // Generates variables to store the embeds fields
                let executor = null, reason = null;

                // Looks for the last timeout in the audit registry
                const fetchedLogs = await newMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: discord.AuditLogEvent.MemberUpdate,
                });

                // Stores the first search result
                const timeoutLog = fetchedLogs.entries.first();
                
                // If a timeout was found in the first result, and less than 5 seconds have passed
                if (timeoutLog && (timeoutLog.createdTimestamp > (Date.now() - 5000)) && timeoutLog.target.id === newMember.id) {

                    // Updates the executor and reason fields
                    executor = timeoutLog.executor;
                    reason = timeoutLog.reason;
                };

                // Stores the timeouted or untimeouted user's records cache, if it exists
                const loggingCache = (client.loggingCache && client.loggingCache[newMember.id]) ? client.loggingCache[newMember.id] : null;
            
                // If it is a timeouted or untimeouted user cache
                if (loggingCache && loggingCache.action.includes('timeout')) {

                    // Stores the correct moderator
                    if (!executor) executor = await client.users.fetch(loggingCache.executor);

                    // Stores the formatted reason
                    if (!reason) reason = loggingCache.reason;

                    // Deletes the member records cache
                    delete client.loggingCache[newMember.id];
                };

                // If it has been timeouted
                if (newMember.communicationDisabledUntilTimestamp && newMember.communicationDisabledUntilTimestamp > Date.now()) {

                    // Sends a message to the records channel
                    await client.functions.managers.sendLog('timeoutedMember', 'embed', new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                        .setAuthor({ name: await client.functions.utils.parseLocale(locale.communicationDisabled.loggingEmbed.author, { memberTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL() })
                        .addFields(
                            { name: locale.communicationDisabled.loggingEmbed.memberId, value: newMember.id, inline: true },
                            { name: locale.communicationDisabled.loggingEmbed.moderator, value: executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, inline: true },
                            { name: locale.communicationDisabled.loggingEmbed.reason, value: reason || locale.communicationDisabled.loggingEmbed.undefinedReason, inline: true },
                            { name: locale.communicationDisabled.loggingEmbed.expiration, value: `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>`, inline: true }
                        )
                    );

                    try {

                        // Sends a notification to the member
                        await newMember.send({ embeds: [ new discord.EmbedBuilder()
                            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                            .setAuthor({ name: locale.communicationDisabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                            .setDescription(await client.functions.utils.parseLocale(locale.communicationDisabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                            .addFields(
                                { name: locale.communicationDisabled.privateEmbed.moderator, value: executor ? executor.tag : locale.communicationDisabled.loggingEmbed.unknownModerator, inline: true },
                                { name: locale.communicationDisabled.privateEmbed.reason, value: reason || locale.communicationDisabled.privateEmbed.undefinedReason, inline: true },
                                { name: locale.communicationDisabled.privateEmbed.expiration, value: `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>`, inline: true }
                            )
                        ]});

                    } catch (error) {
            
                        // Handles the errors that occur when a private message cannot be delivered
                        if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "muted log" message to @${newMember.user.username} (${newMember.id}) due to an API restriction`);
                        else logger.error(error.stack);
                    };

                // If it has been untimeouted
                } else {

                    // Stores the member's timeout
                    const memberTimeout = await client.functions.db.getData('timeout', newMember.id);

                    // If the timeout was registered in the database
                    if (memberTimeout) {

                        // Deletes the database entry
                        await client.functions.db.delData('timeout', newMember.id);
                    };

                    // Sends a message to the records channel
                    await client.functions.managers.sendLog('untimeoutedMember', 'embed', new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                        .setAuthor({ name: await client.functions.utils.parseLocale(locale.communicationEnabled.loggingEmbed.author, { userTag: newMember.user.tag }), iconURL: newMember.user.displayAvatarURL()})
                        .addFields(
                            { name: locale.communicationEnabled.loggingEmbed.memberId, value: newMember.id.toString(), inline: true },
                            { name: locale.communicationEnabled.loggingEmbed.moderator, value: executor ? executor.tag : locale.communicationEnabled.loggingEmbed.unknownModerator, inline: true },
                            { name: locale.communicationEnabled.loggingEmbed.reason, value: reason || locale.communicationEnabled.loggingEmbed.undefinedReason, inline: true }
                        )
                    );
                    
                    try {

                        // Sends a notification to the member
                        await newMember.send({ embeds: [ new discord.EmbedBuilder()
                            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                            .setAuthor({ name: locale.communicationEnabled.privateEmbed.author, iconURL: newMember.guild.iconURL({ dynamic: true}) })
                            .setDescription(await client.functions.utils.parseLocale(locale.communicationEnabled.privateEmbed.description, { member: newMember, guildName: newMember.guild.name }))
                            .addFields(
                                { name: locale.communicationEnabled.privateEmbed.moderator, value: executor ? executor.tag : locale.communicationEnabled.privateEmbed.unknownModerator, inline: true },
                                { name: locale.communicationEnabled.privateEmbed.reason, value: reason || locale.communicationEnabled.privateEmbed.undefinedReason, inline: true }
                            )
                        ]});

                    } catch (error) {
            
                        // Handles the errors that occur when a private message cannot be delivered
                        if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "unmuted log" message to @${newMember.user.username} (${newMember.id}) due to an API restriction`);
                        else logger.error(error.stack);
                    };
                };
            };
        };

    } catch (error) {

        // Invokes the error handler
        await client.functions.managers.eventError(error);
    };
};

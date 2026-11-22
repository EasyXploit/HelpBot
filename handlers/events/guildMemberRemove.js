// Exports the event management function
export default async (member, locale) => {

    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (member.guild.id !== client.baseGuild.id) return;

        // Stores the records cache of the member, if it exists
        const loggingCache = (client.loggingCache && client.loggingCache[member.id]) ? client.loggingCache[member.id] : null;

        // Stores whether the member was kicked or banned by the bot, based on the records cache
        const kickedByTheBot = loggingCache && loggingCache.action === 'kick';
        const bannedByTheBot = loggingCache && loggingCache.action.includes('ban');

        // Stores whether the bot can read the audit registry
        const canViewAuditLog = !await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ViewAuditLog']);

        // Stores the last kick of the audit registry, if it happened less than 5 seconds ago
        let kickLog = null;

        // If the bot did not kick the member, and can read the audit registry
        if (!kickedByTheBot && canViewAuditLog) {

            // Looks for the last kick in the audit registry
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: discord.AuditLogEvent.MemberKick,
            });

            // Stores the first search result
            const lastKickLog = fetchedLogs.entries.first();

            // Stores the kick if less than 5 seconds have passed
            if (lastKickLog && lastKickLog.createdTimestamp > (Date.now() - 5000)) kickLog = lastKickLog;
        };

        // If the bot kicked the member, or a kick log was found in the first result
        if (kickedByTheBot || kickLog) {

            // If the kicked member was a bot
            if (member.user.bot) {

                // Sends a record to the records channel, unless the kick went to the bot himself
                if (member.user.id !== client.user.id) await client.functions.managers.sendLog('kickedBot', 'embed', new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                    .setDescription(await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { memberTag: member.user.tag }))
                );

            // If the bot kicked the member, or the kick log belongs to the member
            } else if (kickedByTheBot || kickLog.target.id === member.id) {

                // Stores the executor and the reason, from the records cache if the bot kicked the member, or from the kick log otherwise
                const executor = kickedByTheBot ? await client.users.fetch(loggingCache.executor) : kickLog.executor;
                const reason = kickedByTheBot ? loggingCache.reason : kickLog.reason;

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

            // If the kick log belongs to another member, so the kick could not be confirmed
            } else {

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

            // Deletes the member's records cache, if the bot kicked the member
            if (kickedByTheBot) delete client.loggingCache[member.id];

        } else { // If a kick was not found

            // Stores whether the member was banned (in that case, the "guildBanAdd" event sends the ban record)
            let banned = bannedByTheBot;

            // If the bot did not ban the member
            if (!banned) {

                // If the bot can see the bans of the guild
                if (!await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['BanMembers'])) {

                    // Checks if the member is banned
                    banned = !!await member.guild.bans.fetch({ user: member.id, force: true }).catch(() => null);

                // If the bot can read the audit registry
                } else if (canViewAuditLog) {

                    // Looks for the last ban in the audit registry
                    const fetchedBans = await member.guild.fetchAuditLogs({
                        limit: 1,
                        type: discord.AuditLogEvent.MemberBanAdd,
                    });

                    // Stores the first search result
                    const banLog = fetchedBans.entries.first();

                    // Stores the member as banned if a ban was found in the first result and less than 5 seconds have passed
                    banned = !!banLog && Date.now() <= (banLog.createdTimestamp + 5000);
                };
            };

            // If the member was not banned (because it was neither a kick nor a ban)
            if (!banned) {

                // Sends a record to the welcome/farewell channel
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

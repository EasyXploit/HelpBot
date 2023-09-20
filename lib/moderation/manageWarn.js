// Function to handle the infractions generated
export default async (member, reason, action, moderator, message, interaction, channel, filteredURL) => {

    try {

        // Stores the translations
        const locale = client.locale.lib.moderation.manageWarn;

        // Function to timeout
        async function timeout(duration) {

            // Stores the member's timeout, if has one
            const memberTimeout = await client.functions.db.getData('timeout', member.id);

            // Stores the previous expiration of the timeout
            const oldExpiration = memberTimeout ? memberTimeout.untilTimestamp : null;

            // Stores the timeout in the database
            await client.functions.db.genData('timeout', {
                userId: member.id,
                moderatorId: client.user.id,
                untilTimestamp: Date.now() + duration
            });

            // If there is no records cache
            if (!client.loggingCache) client.loggingCache = {};

            // Creates a new entry in the records cache
            client.loggingCache[member.id] = {
                action: 'timeout',
                executor: client.user.id,
                reason: locale.timeoutFunction.reason
            };

            // Stores if the bot has permission to timeout
            const missingPermission = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ModerateMembers']);

            // Sends a message to the console if the bot had no permission to timeout
            if (missingPermission) return logger.warn(`The bot was not allowed to temporarily isolate ${member.user.tag} (${member.id}) during the auto-moderation cycle`);
            
            // Disables member communication on the server
            await member.disableCommunicationUntil((Date.now() + duration), locale.timeoutFunction.reason);

            // Sends a message to the infraction channel
            if (channel.type !== discord.ChannelType.DM) await channel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(oldExpiration ? locale.timeoutFunction.notificationEmbed.extended : locale.timeoutFunction.notificationEmbed.initiated, { memberTag: member.user.tag })}`)
            ]});
        };

        // Function to kick
        async function kick() {

            // Stores if the bot has permission to kick
            const missingPermission = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['KickMembers']);

            // Sends a message to the console if the bot had no permission to kick
            if (missingPermission) return logger.warn(`The bot was not allowed to kick ${member.user.tag} (${member.id}) during the auto-moderation cycle`);

            // Sends a message to the infraction channel
            if (channel.type !== discord.ChannelType.DM) await channel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.kickFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            try {

                // Sends a message to the member
                await member.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                    .setAuthor({ name: locale.kickFunction.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                    .setDescription(await client.functions.utils.parseLocale(locale.kickFunction.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                    .addFields(
                        { name: locale.kickFunction.privateEmbed.moderator, value: `${client.user}`, inline: true },
                        { name: locale.kickFunction.privateEmbed.reason, value: locale.kickFunction.reason, inline: true }
                    )
                ]});

            } catch (error) {
    
                // Handles the errors that occur when a private message cannot be delivered
                if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "kick log" message to @${member.user.username} (${member.id}) due to an API restriction`);
                else logger.error(error.stack);
            };

            // Kicks the member
            await member.kick(reason);
        };

        // Function to ban
        async function ban(duration) {

            // Stores if the bot has permission to ban
            const missingPermission = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['BanMembers']);

            // Sends a message to the console if the bot had no permission to ban
            if (missingPermission) return logger.warn(`The bot was not allowed to ban ${member.user.tag} (${member.id}) during the auto-moderation cycle`);

            // If a limited duration was specified
            if (duration) {

                // Stores the ban in the database
                await client.functions.db.genData('ban', {
                    userId: member.id,
                    moderatorId: client.user.id,
                    untilTimestamp: Date.now() + duration
                });
            };

            // If there is no records cache
            if (!client.loggingCache) client.loggingCache = {};

            // Creates a new entry in the records cache
            client.loggingCache[member.id] = {
                action: duration ? 'tempban' : 'ban',
                executor: client.user.id,
                reason: locale.banFunction.reason
            };

            // If expiration was specified, the cache stores it
            if (duration) client.loggingCache[member.id].until = Date.now() + duration;

            // Sends a message to the infraction channel
            if (channel.type !== discord.ChannelType.DM) await channel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                .setDescription(`${client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.banFunction.notificationEmbed, { memberTag: member.user.tag })}`)
            ]});

            try {

                // Sends a message to the member
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

            } catch (error) {
    
                // Handles the errors that occur when a private message cannot be delivered
                if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "ban log" message to @${member.user.username} (${member.id}) due to an API restriction`);
                else logger.error(error.stack);
            };

            // Bans the member
            await client.baseGuild.members.ban(member.user, {reason: locale.banFunction.reason });
        };

        // Capitalizes the reason of the warning
        const warnReason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        try {

            // Sends a warning message to the member by DM
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

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "warn log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else logger.error(error.stack);
        };

        // If it is a channel that is not DM
        if (channel.type !== discord.ChannelType.DM) {

            // Stores if the bot has permission to use external emojis on the warning channel
            const missingExtEmojisPermissions = interaction || channel.type !== discord.ChannelType.DM ? await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['UseExternalEmojis']) : false;

            // Sends a warning to the console if the permission to use external emojis is missing
            if (missingExtEmojisPermissions) logger.warn(`The bot does not have permission to use external emojis in the channel ${channel.name} (${channel.id}), so the warns will not be in the expected format`);

            // If it is an interaction
            if (interaction) {

                // Responds to the interaction with the warning
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setDescription(`${missingExtEmojisPermissions ? '' : client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});

            } else {

                // Sends a message with the warning
                if (channel.type !== discord.ChannelType.DM) await message.channel.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
                    .setDescription(`${missingExtEmojisPermissions ? '' : client.customEmojis.orangeTick} ${await client.functions.utils.parseLocale(locale.warn.notificationEmbed, { memberTag: member.user.tag, warnReason: warnReason })}.`)
                ]});
            };
        };

        // Deletes the message if it is to be done (and notifies if it is not possible)
        if (action === 1 || action === 3) if (message.deletable) message.delete();
        else if (message.channel.type !== discord.ChannelType.DM) logger.warn(`The bot does not have permission to delete the message with ID ${message.id} from ${message.author.tag} (${message.author.id}) on ${message.channel.name} (${message.channel.id})`);

        // Warn if has to do so
        if (action === 2 || action === 3) {

            // Stores the member's profile, or creates it
            let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });

            // Stores the member warnings
            let memberWarns = memberProfile.moderationLog.warnsHistory;

            // Generates an Id for the infraction
            const warnId = await client.functions.utils.generateSid();

            // Generates an array to store the filtered content
            let filteredContent = [];

            // If a message was warned and had content, it stores it
            if (message && message.content) filteredContent.push(message.content);

            // If a message was warned and had attachments
            if (message && message.attachments.size > 0) {

                // Gets an array with the attachments of the filtered message
                const attachmentsArray = Array.from(message.attachments.values());

                // Adds the URL of each attachment to the array of filtered content
                for (const attachment of attachmentsArray) filteredContent.push(attachment.url);
            };

            // Adds the warning to the list
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
            
            // Records the warning in the database
            await client.functions.db.setData('profile', member.id, memberProfile);

            // Executes the records handler
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

            // If appropriate, attaches the filtered message
            if (message && await client.functions.db.getConfig('moderation.attachFilteredMessages')) await client.functions.managers.sendLog('warnedMember', 'file', new discord.AttachmentBuilder(Buffer.from(filteredURL || message.content, 'utf-8'), { name: `filtered-${Date.now()}.txt` }));

            // Temporarily bans the members who have just joined the server and broke the rules
            if (message && channel.type === discord.ChannelType.DM && (member.joinedTimestamp + await client.functions.db.getConfig('moderation.newMemberTimeDelimiter')) < Date.now()) {

                // Executes the ban function
                return ban(await client.functions.db.getConfig('moderation.newInfractorBanDuration'));
            };

            // Function to compare an array
            function compare(a, b) {
                if (a.quantity < b.quantity) return 1;
                if (a.quantity > b.quantity) return -1;
                return 0;
            };

            // Compares and orders the rules array
            const automodRules = await client.functions.db.getConfig('moderation.automodRules')
            const sortedRules = automodRules.sort(compare);

            // For each of the automod rules
            for (const rule of sortedRules) {

                // Stores the infractions count
                let warnsCount = 0;

                // For each of the member infractions
                for (const entry of memberWarns) {

                    // If it does not exceed the age threshold of the rule, adds it to the count
                    if (Date.now() - entry.timestamp <= rule.age) warnsCount++;
                };

                // If the maximum amount of the rule is matched or exceeded
                if (warnsCount >= rule.quantity) {

                    // Executes the corresponding moderation action
                    switch (rule.action) {
                        case 'timeout':     timeout(rule.duration); break;
                        case 'kick':        kick();                 break;
                        case 'tempban':     ban(rule.duration);     break;
                        case 'ban':         ban();                  break;
                    };

                    // Aborts as soon as it has been executed
                    break;
                };
            };
        };
        
    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

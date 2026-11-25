// Function to check the timeouts
export async function checkTimeouts(forceExpireAll) {

    // Loads the translations
    const locale = client.locale.lib.loaders.intervals.timeouts;

    // Stores members timeouts
    const memberTimeouts = await client.functions.db.getData('timeout') || [];

    // Stores the latest timeout of each member, to discard the duplicated ones (created by previous versions)
    const latestTimeouts = new Map();

    // For each of the timeouts of the database
    for (const timeoutData of memberTimeouts) {

        // Stores the latest timeout of the member found so far
        const latestTimeout = latestTimeouts.get(timeoutData.userId);

        // If there was no other timeout for the member, stores this one and continues
        if (!latestTimeout) {
            latestTimeouts.set(timeoutData.userId, timeoutData);
            continue;
        };

        // Deletes the oldest of both from the database, and keeps the latest one
        if (timeoutData.untilTimestamp > latestTimeout.untilTimestamp) {
            await latestTimeout.deleteOne();
            latestTimeouts.set(timeoutData.userId, timeoutData);
        } else await timeoutData.deleteOne();
    };

    // For each of the timeouts of the database
    for (let timeoutData of latestTimeouts.values()) {

        // Omits if the sanction has not yet expired
        if (!forceExpireAll && Date.now() < timeoutData.untilTimestamp) continue;

        // Looks for the member
        const member = await client.functions.utils.fetch('member', timeoutData.userId);

        // Stores whether the timeout is still active in Discord (when the expiration is forced, as Discord removes the expired ones by itself)
        const stillActive = member && member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now();

        // If the timeout is still active in Discord, but its expiration was not forced, it was extended without updating the database
        if (stillActive && !forceExpireAll) {

            // Updates the expiration in the database, and continues with the next timeout
            timeoutData.untilTimestamp = member.communicationDisabledUntilTimestamp;
            await timeoutData.save();
            continue;
        };

        // Removes the timeout of the database
        await timeoutData.deleteOne();

        // If the timeout is still active in Discord
        if (stillActive) {

            // If the bot can not remove it, warns about it and continues with the next timeout
            if (await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ModerateMembers'])) {
                logger.warn(`The bot could not un-timeout ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                continue;
            };

            // Creates an entry in the records cache, so the "guildMemberUpdate" event sends the record with the bot as the moderator
            if (!client.loggingCache) client.loggingCache = {};
            client.loggingCache[member.id] = {
                action: 'untimeout',
                executor: client.user.id,
                reason: locale.reason
            };

            // Removes the timeout in Discord
            await member.disableCommunicationUntil(null, locale.reason);
        };

        // Stores the author of the embed for the record
        let authorProperty = { name: member ? await client.functions.utils.parseLocale(locale.loggingEmbed.author, { userTag: member.user.tag }) : locale.loggingEmbed.authorNoMember };
        if (member) authorProperty.iconURL = member.user.displayAvatarURL();
        
        // Executes the records handler (unless the timeout was removed in Discord, as the "guildMemberUpdate" event sends the record then)
        if (!stillActive) await client.functions.managers.sendLog('untimeoutedMember', 'embed', new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setAuthor(authorProperty)
            .addFields(
                { name: locale.loggingEmbed.memberId, value: timeoutData.userId.toString(), inline: true },
                { name: locale.loggingEmbed.moderator, value: `${client.user}`, inline: true },
                { name: locale.loggingEmbed.reason, value: locale.reason, inline: true }
            )
        );

        try {
        
            // Sends a confirmation to the member
            if (member) await member.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                .addFields(
                    { name: locale.privateEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.privateEmbed.reason, value: locale.reason, inline: true }
                )
            ]});

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "untimeouted log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else logger.error(error.stack);
        };
    };
};

// Function to check the bans
export async function checkBans(forceExpireAll) {

    // Loads the translations
    const locale = client.locale.lib.loaders.intervals.bans;

    // Stores the temporary bans list
    const temporalBans = await client.functions.db.getData('ban');

    // For each of the temporary bans of the database
    for (let banData of temporalBans) {

        // Omits if it has not yet to be unbanned
        if (!forceExpireAll && Date.now() < banData.untilTimestamp) continue;

        try {

            // If there is no records cache
            if (!client.loggingCache) client.loggingCache = {};

            // Creates a new entry in the records cache, so the "guildBanRemove" event sends the record
            client.loggingCache[banData.userId] = {
                action: 'unban',
                executor: client.user.id,
                reason: locale.reason
            };

            // Unbans the user (by its ID, so it works even if the account no longer exists)
            await client.baseGuild.members.unban(banData.userId, locale.reason);

            // Removes the entry of the ban into the database
            await client.functions.db.delData('ban', banData.userId);

        } catch (error) {

            // If the ban was manually removed, or the user no longer exists
            if (error.toString().includes('Unknown Ban') || error.toString().includes('Unknown User')) {

                // Deletes the records cache and the entry of the ban into the database
                delete client.loggingCache[banData.userId];
                await client.functions.db.delData('ban', banData.userId);

                // Continues with the next ban
                continue;
            };

            // Sends an error message to the console
            logger.error(error.stack);
        };
    };
};

// Function to check the websocket response time
export async function checkPing() {

    // Stores the current ping
    const actualPing = Math.round(client.ping);

    // If the ping descends from the established threshold
    if (actualPing > await client.functions.db.getConfig('system.pingMsTreshold')) {

        // Sends a warning to the console
        logger.warn(`High websocket response time: ${actualPing} ms\n`);
    };
};

// Stores if the polls are being checked, to avoid overlapping checks
let checkingPolls = false;

// Function to check the polls
export async function checkPolls(forceExpireAll) {

    // Aborts if a previous check has not finished yet
    if (checkingPolls) return;
    checkingPolls = true;

    try {

        // Loads the translations
        const locale = client.locale.lib.loaders.intervals.polls;

        // Stores the list of polls in progress
        const currentPolls = await client.functions.db.getData('poll') || [];

        // For each of the polls in the database
        for (let pollData of currentPolls) {

            try {

                // Omits this poll if has no expiration
                if (!pollData.expirationTimestamp) continue;

                // Looks for the polls channel
                const channel = await client.functions.utils.fetch('channel', pollData.channelId);

                // Looks for the message of the poll
                const poll = channel ? await client.functions.utils.fetch('message', pollData.messageId, channel) : null;

                // If the channel or poll was not found
                if (!channel || !poll) {

                    // Deletes the poll form the database, and omits it
                    await client.functions.db.delData('poll', pollData.pollId);
                    continue;
                };

                // If the poll has already expired
                if (forceExpireAll || Date.now() > pollData.expirationTimestamp) {

                    // Deletes the poll from the database first, so it is not ended again if something fails
                    await client.functions.db.delData('poll', pollData.pollId);

                    // Stores the votes made
                    let votes = [];

                    // Stores the total number of votes
                    let totalVotes = 0;

                    // For each of the reactions of the options (the ones added by the bot)
                    poll.reactions.cache.filter(reaction => reaction.me).forEach(reaction => {

                        // Adds the reaction votes to the votes array (not counting the bot one)
                        votes.push({
                            emoji: reaction.emoji.name,
                            count: reaction.count - 1
                        });

                        // Adds the total number of votes (not counting the bot one)
                        totalVotes += reaction.count - 1;
                    });

                    // Stores the poll results
                    let results = [];

                    // For each of the votes of the poll
                    for (let index = 0; index < votes.length; index++) {

                        // Stores the amount of votes of the option
                        const count = votes[index].count;

                        // Stores the percentage of votes of the option with respect to the others
                        const percentage = (count / totalVotes) * 100;

                        // Rounds the percentage
                        let roundedPercentage = Math.round((percentage + Number.EPSILON) * 100) / 100;

                        // If it is not a valid value, it changes it to 0
                        if (isNaN(roundedPercentage)) roundedPercentage = 0;

                        // Adds the string of the result to the array of results
                        results.push(`🞄 ${votes[index].emoji} ${await client.functions.utils.parseLocale(locale.votesPercentage, { votesCount: count, percentage: roundedPercentage })}`);
                    };

                    // Checks if the bot has the permissions required to send the results in the channel, and sends them if has them
                    const missingPermissions = await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles'], true);
                    if (missingPermissions) logger.warn(`The bot could not send the results of the poll with ID ${pollData.pollId} because it did not have the following permissions on #${channel.name} (${channel.id}): ${missingPermissions}`);
                    else await channel.send({ embeds: [ new discord.EmbedBuilder()
                        .setAuthor({ name: locale.finishedEmbed.author, iconURL: 'attachment://endFlag.png' })
                        .setDescription(`${pollData.title}\n\n${pollData.options}`)
                        .addFields({ name: locale.finishedEmbed.results, value: results.length > 0 ? results.join(' ') : '-', inline: false })
                    ], files: ['./assets/images/endFlag.png']});

                    // Sends a notification to the records channel
                    await client.functions.managers.sendLog('pollEnded', 'embed', new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                        .setTitle(`📑 ${locale.loggingEmbed.title}`)
                        .setDescription(`${await client.functions.utils.parseLocale(locale.loggingEmbed.description, { poll: `[${pollData.title}](${poll.url})`, channel: channel })}.`)
                    );

                    // Deletes the message of the poll
                    await poll.delete().catch(error => logger.warn(`The bot could not delete the message of the poll with ID ${pollData.pollId}: ${error.message}`));

                } else { // If the poll has not yet expired

                    // Calculates the remaining time
                    const remainingTime = pollData.expirationTimestamp - Date.now();

                    // Calculates the remaining time format
                    const remainingDays = Math.floor(remainingTime / (60 * 60 * 24 * 1000));
                    const remainingHours = Math.floor((remainingTime - (remainingDays * 86400000)) / (60 * 60 * 1000));
                    const remainingMinutes = Math.floor((remainingTime - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60 * 1000));

                    // Stores the previous remaining time
                    const oldRemainingTime = poll.embeds[0] && poll.embeds[0].footer ? poll.embeds[0].footer.text : null;

                    // Generates the string of the new footer
                    const newRemainingTime = `ID: ${pollData.pollId} - ${await client.functions.utils.parseLocale(locale.progressEmbed.remaining, { remainingDays: remainingDays, remainingHours: remainingHours, remainingMinutes: remainingMinutes })}`;

                    // If the time string should change, edits the poll message
                    if (oldRemainingTime !== newRemainingTime) await poll.edit({ embeds: [ new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.polls')}`)
                        .setAuthor({ name: locale.progressEmbed.author, iconURL: 'attachment://poll.png' })
                        .setDescription(`${pollData.title}\n\n${pollData.options}`)
                        .setFooter({ text: newRemainingTime })
                    ]});
                };

            } catch (error) {

                // Logs the error, and continues with the next poll
                logger.error(`An error occurred while checking the poll with ID ${pollData.pollId}: ${error.stack}`);
            };
        };

    } finally {

        // Allows the next check
        checkingPolls = false;
    };
};

// Function to update the voice time
export async function updateVoiceTime() {

    // Creates an object in the client for users voice time
    if (!client.usersVoiceStates) client.usersVoiceStates = {};

    // For each state of voice of the records
    for (let idKey in client.usersVoiceStates) {

        // Stores the member
        const member = await client.functions.utils.fetch('member', idKey);

        // Removes the member of the voice states if the user is not in voice time
        if (!member || !member.voice.channelId) {

            // Removes the entry of the voice states
            delete client.usersVoiceStates[idKey];

            // Omits the iteration
            continue;
        };

        // Skips the member if it is muted, deafened or alone (or only with bots), so the rest of the members are still processed (it keeps being monitored, so it earns again when this changes)
        if (member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(member => !member.user.bot).size === 1) {

            // Updates the timestamp of the last reward, so the time it was skipped is not counted when it leaves the channel
            client.usersVoiceStates[member.id].lastXpReward = Date.now();

            // Omits the iteration
            continue;
        };

        // Checks if the experience system is enabled
        const xpEnabled = await client.functions.db.getConfig('leveling.experienceSystemEnabled');

        // Updates the timestamp of the last reward obtained (experience or voice time), so it is not counted again when the member leaves the channel
        client.usersVoiceStates[member.id].lastXpReward = Date.now();

        // If the experience system is enabled, adds XP to the member
        if (xpEnabled) await client.functions.leveling.addExperience(member, 'voice', member.voice.channel);

        // If the voice time is counted
        if (await client.functions.db.getConfig('leveling.collectVoiceTime')) {

            // Stores the member's profile, or creates it
            let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });

            // Updates the voice time of the member
            memberProfile.stats.aproxVoiceTime += await client.functions.db.getConfig('leveling.XPGainInterval');

            // Saves the new statistics of the member in the database
            await client.functions.db.setData('profile', member.id, memberProfile);
        };
    };
};

// Function to update the presence
export async function updatePresence() {

    // Updates the bot's presence
    await client.functions.managers.updatePresence();
};

// Function to check the usernames
export async function checkUsernames() {

    // Aborts if automod or the kick of members with bad usernames are disabled, as the usernames check is part of them
    if (!await client.functions.db.getConfig('moderation.automodEnabled') || !await client.functions.db.getConfig('moderation.kickOnBadUsername')) return;

    // For each of the guild members
    await client.baseGuild.members.cache.forEach(async guildMember => {

        // Checks if the username (visible) of the member is valid
        await client.functions.moderation.checkUsername(guildMember);
    });
};
    
// Exports a function to load all the functions executed at intervals
export async function loadIntervals() {

    // Stops the intervals that were already running (if the system is loaded again), so they are not duplicated
    stopAllIntervals();

    // Stores the interval functions in the client
    client.intervals = {};

    // Stores the moderation, engagement and polls module status
    const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');
    const engagementModuleEnabled = await client.functions.db.getConfig('system.modules.engagement');
    const pollsModuleEnabled = await client.functions.db.getConfig('system.modules.polls');

    // Sets the interval to check the timeouts
    client.intervals.checkTimeouts = {
        id: moderationModuleEnabled ? setInterval(async () => { await checkTimeouts(); }, 5000) : null,
        function: checkTimeouts,
        interval: 5000
    };

    // Sets the interval to check the bans
    client.intervals.checkBans = {
        id: moderationModuleEnabled ? setInterval(async () => { await checkBans(); }, 5000) : null,
        function: checkBans,
        interval: 5000
    };

    // Sets the interval to check the websocket response time
    client.intervals.checkPing = {
        id: setInterval(async () => { await checkPing(); }, 60000),
        function: checkPing,
        interval: 60000
    };

    // Sets the interval to check the polls
    client.intervals.checkPolls = {
        id: pollsModuleEnabled ? setInterval(async () => { await checkPolls(); }, 5000) : null,
        function: checkPolls,
        interval: 5000
    };

    // Sets the interval to update the voice time
    client.intervals.updateVoiceTime = {
        id: engagementModuleEnabled ? setInterval(async () => { await updateVoiceTime(); }, await client.functions.db.getConfig('leveling.XPGainInterval')) : null,
        function: updateVoiceTime,
        interval: await client.functions.db.getConfig('leveling.XPGainInterval')
    };

    // Sets the interval to update the presence
    client.intervals.updatePresence = {
        id: setInterval(async () => { await updatePresence(); }, 60000),
        function: updatePresence,
        interval: 60000
    };

    // Sets the interval to check the usernames (it checks by itself if it has to kick the members)
    client.intervals.checkUsernames = {
        id: moderationModuleEnabled ? setInterval(async () => { await checkUsernames(); }, 120000) : null,
        function: checkUsernames,
        interval: 120000
    };

    // Shows a log message in the console
    logger.debug('Intervals loading completed');
};

// Function to stop all the intervals
export function stopAllIntervals() {

    // Stops each of the intervals, if any
    for (const name of Object.keys(client.intervals || {})) stopInterval(name);

    // Stops the intervals of the scheduled messages, if any
    if (client.scheduledMessageIntervals) client.scheduledMessageIntervals.forEach(interval => clearInterval(interval));
    client.scheduledMessageIntervals = [];
};

// Exports a function to stop an interval
export function stopInterval(name) {

    // If the interval exists
    if (client.intervals[name]) {

        // Stops the interval
        clearInterval(client.intervals[name].id);

        // Marks the interval as stopped, keeping its data so it can be started again
        client.intervals[name].id = null;
    };
};

// Exports a function to start an interval
export function startInterval(name) {

    // If the interval exists and is not already running
    if (client.intervals[name] && !client.intervals[name].id) {

        // Starts the interval
        client.intervals[name].id = setInterval(client.intervals[name].function, client.intervals[name].interval);
    };
};

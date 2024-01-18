// Exports a function to load all the programs executed at intervals
export async function loadIntervals() {

    // Translations of the intervals
    const locale = client.locale.lib.loaders.intervals;

    // TIMEOUTS
    // Checking of temporarily timeouted members
    setInterval(async () => {

        // Stores members timeouts
        const memberTimeouts = await client.functions.db.getData('timeout');
        
        // For each of the timeouts of the database
        for (let timeoutData of memberTimeouts) {

            // Omits if the sanction has not yet expired
            if (Date.now() < timeoutData.untilTimestamp) continue;
            
            // Looks for the member
            const member = await client.functions.utils.fetch('member', timeoutData.userId);

            // Removes the timeout of the database
            await client.functions.db.delData('timeout', timeoutData.userId);

            // Stores the author of the embed for the record
            let authorProperty = { name: member ? await client.functions.utils.parseLocale(locale.timeouts.loggingEmbed.author, { userTag: member.user.tag }) : locale.timeouts.loggingEmbed.authorNoMember };
            if (member) authorProperty.iconURL = member.user.displayAvatarURL();
            
            // Executes the records handler
            await client.functions.managers.sendLog('untimeoutedMember', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor(authorProperty)
                .addFields(
                    { name: locale.timeouts.loggingEmbed.memberId, value: timeoutData.userId.toString(), inline: true },
                    { name: locale.timeouts.loggingEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.timeouts.loggingEmbed.reason, value: locale.timeouts.reason, inline: true }
                )
            );

            try {
            
                // Sends a confirmation to the member
                if (member) await member.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                    .setAuthor({ name: locale.timeouts.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                    .setDescription(await client.functions.utils.parseLocale(locale.timeouts.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                    .addFields(
                        { name: locale.timeouts.privateEmbed.moderator, value: `${client.user}`, inline: true },
                        { name: locale.timeouts.privateEmbed.reason, value: locale.timeouts.reason, inline: true }
                    )
                ]});

            } catch (error) {
    
                // Handles the errors that occur when a private message cannot be delivered
                if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "unmuted log" message to @${member.user.username} (${member.id}) due to an API restriction`);
                else logger.error(error.stack);
            };
        };
    }, 5000);

    // BANS
    // Checking of temporarily banned members
    setInterval(async () => {

        // Stores the temporary bans list
        const temporalBans = await client.functions.db.getData('ban');

        // For each of the temporary bans of the database
        for (let banData of temporalBans) {

            // Omits if it has not yet to be unbanned
            if (Date.now() < banData.untilTimestamp) continue;

            // Looks for the Discord user
            const user = await client.users.fetch(banData.userId);

            try {

                // Unbans the user (if it exists)
                if (user) await client.baseGuild.members.unban(banData.userId);

                // Removes the entry of the ban into the database
                await client.functions.db.delData('ban', banData.userId);

                // Executes the records handler
                await client.functions.managers.sendLog('unbannedMember', 'embed', new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                    .setAuthor({ name: await client.functions.utils.parseLocale(locale.bans.loggingEmbed.author, { userTag: user.tag }), iconURL: user.displayAvatarURL() })
                    .addFields(
                        { name: locale.bans.loggingEmbed.user, value: user.tag, inline: true },
                        { name: locale.bans.loggingEmbed.moderator, value: `${client.user}`, inline: true },
                        { name: locale.bans.loggingEmbed.reason, value: locale.bans.reason, inline: true }
                    )
                );

            } catch (error) {

                // Omits the error if the ban was manually removed
                if (error.toString().includes('Unknown Ban')) return;

                // Sends an error message to the console
                logger.error(error.stack);
            };
        };
    }, 5000);

    // PING
    // Checking of Websocket response time
    setInterval(async () => {

        // Stores the current ping
        const actualPing = Math.round(client.ping);

        // If the ping descends from the established threshold
        if (actualPing > await client.functions.db.getConfig('system.pingMsTreshold')) {

            // Sends a warning to the console
            logger.warn(`High websocket response time: ${actualPing} ms\n`);
        };
    }, 60000);

    // USERNAMES
    // Checking of member usernames
    if (await client.functions.db.getConfig('moderation.kickOnBadUsername')) setInterval(async () => {

        // For each of the guild members
        await client.baseGuild.members.cache.forEach(async guildMember => {

            // Checks if the username (visible) of the member is valid
            await client.functions.moderation.checkUsername(guildMember);
        });

    }, 120000);

    // SURVEYS
    // Checking of expired surveys
    setInterval(async () => {

        // Stores the list of surveys in progress
        const currentPolls = await client.functions.db.getData('poll');

        // For each of the surveys in the database
        for (let pollData of currentPolls) {

            // Omits this survey if has no expiration
            if (!pollData.expirationTimestamp) continue;

            // Looks for the survey channel
            const channel = await client.functions.utils.fetch('channel', pollData.channelId);

            // Looks for the message of the survey
            const poll = await client.functions.utils.fetch('message', pollData.messageId, channel);

            // If the channel or survey was not found
            if (!channel || !poll) {

                // Deletes the survey form the database
                await client.functions.db.delData('poll', pollData.pollId);
            };

            // If the survey has already expired
            if (Date.now() > pollData.expirationTimestamp) {

                // Stores the votes made
                let votes = [];

                // Stores the total number of votes
                let totalVotes = 0;

                // For each of the survey reactions
                poll.reactions.cache.forEach(reaction => {

                    // Adds the reaction votes to the votes array
                    votes.push({
                        emoji: reaction._emoji.name,
                        count: reaction.count - 1
                    });

                    // Adds the total number of votes (not counting the bot one)
                    totalVotes += reaction.count - 1;
                });

                // Stores the survey results
                let results = [];

                // For each of the votes of the survey
                for (let index = 0; index < votes.length; index++) {

                    // Stores the amount of votes of the option
                    const count = votes[index].count;

                    // Stores the percentage of votes of the option with respect to the others
                    const percentage = (count / totalVotes) * 100;

                    // Rounds the percentage
                    let roundedPercentage = Math.round((percentage + Number.EPSILON) * 100) / 100;

                    // If it is not a valid value, it changes it to 0
                    if(isNaN(roundedPercentage)) roundedPercentage = 0;

                    // Adds the string of the result to the array of results
                    results.push(`🞄 ${votes[index].emoji} ${await client.functions.utils.parseLocale(locale.polls.votesPercentage, { votesCount: count, percentage: roundedPercentage })}`);
                };

                // Checks if the bot has the permissions required to send the results, and Sends them if has them
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles']);
                if (missingPermissions) logger.warn(`The bot could not send the results of the poll with ID ${pollData.pollId} because it did not have the "Send Messages", "Embed Links" and "Attach Files" permissions on #${poll.channel.name} (${poll.channel.id})`);
                else await poll.channel.send({ embeds: [ new discord.EmbedBuilder()
                    .setAuthor({ name: locale.polls.finishedEmbed.author, iconURL: 'attachment://endFlag.png' })
                    .setDescription(`${pollData.title}\n\n${pollData.options}`)
                    .addFields({ name: locale.polls.finishedEmbed.results, value: results.join(' '), inline: false })
                ], files: ['./assets/images/endFlag.png']});

                // Sends a notification to the records channel
                await client.functions.managers.sendLog('pollEnded', 'embed', new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                    .setTitle(`📑 ${locale.polls.loggingEmbed.title}`)
                    .setDescription(`${await client.functions.utils.parseLocale(locale.polls.loggingEmbed.description, { poll: `[${pollData.title}](${poll.url})`, channel: channel })}.`)
                );
                
                // Deletes the message of the survey
                await poll.delete();

                // Deletes the survey from the database
                await client.functions.db.delData('poll', pollData.pollId);

            } else { // If the survey has not yet expired

                // Calculates the remaining time
                const remainingTime = pollData.expiration - Date.now();

                // Calculates the remaining time format
                const remainingDays = Math.floor(remainingTime / (60 * 60 * 24 * 1000));
                const remainingHours = Math.floor((remainingTime - (remainingDays * 86400000)) / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remainingTime - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60 * 1000));

                // Stores the previous remaining time
                const oldRemainingTime = poll.footer;

                // Generates the string of the new footer
                const newRemainingTime = `ID: ${idKey} - ${await client.functions.utils.parseLocale(locale.polls.progressEmbed.remaining, { remainingDays: remainingDays, remainingHours: remainingHours, remainingMinutes: remainingMinutes })}`;

                // If the time string should change, edits the survey message
                if (oldRemainingTime !== newRemainingTime) await poll.edit({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.polls')}`)
                    .setAuthor({ name: locale.polls.progressEmbed.author, iconURL: 'attachment://poll.png' })
                    .setDescription(`${pollData.title}\n\n${pollData.options}`)
                    .setFooter({ text: newRemainingTime })
                ]});
            };
        };
    }, 5000);

    // XP DUE TO VOICE TIME
    // Checking of elapsed voice time
    setInterval(async () => {

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

            // Checks whether the member is timeouted, deafen or only with a bot
            if (member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(member => !member.user.bot).size === 1) return;

            // Adds XP to the member
            await client.functions.leveling.addExperience(member, 'voice', member.voice.channel);

            // Updates the timestamp of the last XP reward obtained
            client.usersVoiceStates[member.id].lastXpReward = Date.now();

            // Stores the member's profile, or creates it
            let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });

            // Updates the voice time of the member
            memberProfile.stats.aproxVoiceTime += await client.functions.db.getConfig('leveling.XPGainInterval');

            // Saves the new statistics of the member in the database
            await client.functions.db.setData('profile', member.id, memberProfile);
        };
        
    }, await client.functions.db.getConfig('leveling.XPGainInterval'));

    // PRESENCE
    // Update of the total members in presence
    setInterval(async () => {

        // Updates the bot's presence
        await client.functions.managers.updatePresence();

    }, 60000);

    // Shows a log message in the console
    logger.debug('Intervals loading completed');
};
// Function to add XP (mode = message || voice)
export default async (member, mode, channel) => {

    // Stores the translations
    const locale = client.locale.lib.leveling.addExperience;

    // To check if the role can win XP or not
    const notAuthorizedToEarnXp = await client.functions.utils.checkAuthorization(member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

    // Returns if can't win XP
    if (notAuthorizedToEarnXp) return;

    // Stores the channels that cannot generate XP
    const nonXPChannels = await client.functions.db.getConfig('leveling.nonXPChannels');

    // If can't win XP on the channel, aborts
    if (nonXPChannels.includes(channel.id)) return;

    // Stores the member's profile, or creates it
    let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });
    
    // Stores the member statistics
    let memberStats = memberProfile.stats;

    // Generates random XP according to ranges
    const newXp = await client.functions.utils.randomIntBetween(await client.functions.db.getConfig('leveling.minimumXpReward'), await client.functions.db.getConfig('leveling.maximumXpReward'));

    // Adds the XP to the current amount of the member
    memberStats.experience += newXp;

    // Calculates the XP necessary to rise to the next level
    const neededExperience = await client.functions.leveling.getNeededExperience(memberStats.experience);

    // Checks if the member has to rise level
    if (neededExperience.nextLevel > memberStats.level) {

        // Adjusts the level of the member
        memberStats.level++;

        // Assigns the rewards corresponding to the level (if applicable), and stores the rewarded roles
        const rewardedRoles = await client.functions.leveling.assignRewards(member, memberStats.level);

        // Generates an embed of level rise
        let levelUpEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setAuthor({ name: locale.levelUpEmbed.author, iconURL: member.user.displayAvatarURL() })
            .setDescription(`${await client.functions.utils.parseLocale(locale.levelUpEmbed.description, { member: member, memberLevel: memberStats.level })}.`);

        // Generates a row of buttons
        const buttonsRow = new discord.ActionRowBuilder();
        
        // Adds a button to the row, if it comes to the voice mode
        if (mode === 'voice') buttonsRow.addComponents(

            // Generates a button to activate or deactivate notifications
            new discord.ButtonBuilder()
                .setLabel(locale.levelUpEmbed.disablePrivateNotification)
                .setStyle(discord.ButtonStyle.Secondary)
                .setCustomId('updateNotifications')
        );

        // If the member was rewarded with roles
        if (rewardedRoles) {

            // Stores the names of the roles
            const roleNames = [];

            // For each of the rewarded roles
            for (const roleId of rewardedRoles) {

                // Looks for the role in the guild
                const fetchedRole = await client.functions.utils.fetch('role', roleId);

                // Adds to the names array the name of the iterated role
                roleNames.push(fetchedRole.name);
            };

            // Adds a field to the level-up embed with the rewarded roles
            levelUpEmbed.addFields({ name: locale.levelUpEmbed.rewards, value: `\`${roleNames.join('`, `')}\`` });
        };

        // Stores the global level configuration
        const levelingConfig = await client.functions.db.getConfig('leveling');

        // If the public level-up message has been configured
        if (mode === 'message' && levelingConfig.notifylevelUpOnChat && memberProfile.notifications.public) {

            // Checks if the bot has the required permissions, and if so, sends the message
            const missingPermissions = await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['SendMessages', 'EmbedLinks']);
            if (missingPermissions) logger.warn(`The bot could not send a level-up message for ${member.user.tag} (${member.id}) in ${channel.name} (${channel.id}) because it did not have the "Send Messages" and/or "Embed Links" permissions on that channel`);
            else channel.send({ embeds: [levelUpEmbed] });
        };

        // If the private level-up message has been configured
        if (mode === 'voice' && levelingConfig.notifylevelUpOnVoice && memberProfile.notifications.private) {

            try {

                // Sends the message privately to the member
                member.send({ embeds: [levelUpEmbed], components: [buttonsRow] });

            } catch (error) {
    
                // Handles the errors that occur when a private message cannot be delivered
                if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "level up log" message to @${member.user.username} (${member.id}) due to an API restriction`);
                else logger.error(error.stack);
            };

        }
    };

    // Saves the new statistics of the member in the database
    await client.functions.db.setData('profile', member.id, memberProfile);
};

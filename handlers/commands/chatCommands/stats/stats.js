export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the member in the guild
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : interaction.member.id);

        // If  not found, returns an error
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});
        
        // Stores the member's profile
        const memberProfile = await client.functions.db.getData('profile', member.id);

        // Returns an error if the member has no profile
        if (!memberProfile) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noXp, { member: member })}.`)
        ], ephemeral: true});

        // To check if the role can win XP or not
        const notAuthorizedToEarnXp = await client.functions.utils.checkAuthorization(member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

        // Function to compare an array
        function compare(a, b) {
            if (a.requiredLevel > b.requiredLevel) return 1;
            if (a.requiredLevel < b.requiredLevel) return -1;
            return 0;
        };

        // Stores the rewards for level up
        const levelingRewards = await client.functions.db.getConfig('leveling.rewards');

        // Compares and orders the rewards array
        const sortedRewards = levelingRewards.sort(compare);

        // Stores the next rewarded roles
        let nextRewardedRoles = {};

        // For each reward
        for (let index = 0; index < sortedRewards.length; index++) {

            // If the required level is greater than or equal to the next level of the member
            if (sortedRewards[index].requiredLevel >= (memberProfile.stats.level + 1)) {

                // Stores the roles of the next reward
                nextRewardedRoles.roles = sortedRewards[index].roles;
                nextRewardedRoles.requiredLevel = sortedRewards[index].requiredLevel

                // Stops the loop
                break;
            };
        };

        // Stores the next default reward
        let nextRewards = locale.defaultReward;

        // If an upcoming reward was found
        if (nextRewardedRoles.roles) {

            // Stores the names of the reward roles
            let roleNames = []; 

            // Creates a promise to resolve when has finished looking for the names of all roles
            const getRewards = new Promise((resolve, reject) => {

                // For each role Id, looks for its name
                nextRewardedRoles.roles.forEach(async (value, index, array) => {

                    // Searches and stores the role
                    const role = await interaction.guild.roles.fetch(value);

                    // Adds to the array of names, the name of the iterated role
                    roleNames.push(role.name);

                    // The promise is resolved if all the roles have been found
                    if (index === array.length -1) resolve();
                });
            });
            
            // Invoke the promise to obtain the names of the roles
            await getRewards.then(() => {

                // Overwrites the variable "nextRewards" with the results obtained
                nextRewards = `${roleNames.join(', ')} (${locale.statsEmbed.level} ${nextRewardedRoles.requiredLevel})`;
            });
        };

        // Stores the approximate voice time
        const aproxVoiceTime = memberProfile.stats.aproxVoiceTime > 0 ? `\`${await client.functions.utils.msToTime(memberProfile.stats.aproxVoiceTime)}\`` : '\`00:00:00\`';

        // Calculates the necessary XP by default for the next level
        const neededExperience = await client.functions.leveling.getNeededExperience(memberProfile.stats.experience);

        // Sends the message with statistics
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setTitle(`🥇 ${locale.statsEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.statsEmbed.description, { memberTag: member.user.tag }))
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: locale.statsEmbed.actualLevel, value: `\`${memberProfile.stats.level}\``, inline: true },
                { name: locale.statsEmbed.experience, value: `\`${memberProfile.stats.experience}\``, inline: true },
                { name: locale.statsEmbed.xpToNextLevel, value: notAuthorizedToEarnXp ? `\`${locale.statsEmbed.noXpToNextLevel}\`` : `\`${neededExperience.experience}\``, inline: true },
                { name: locale.statsEmbed.messagesCount, value: `\`${memberProfile.stats.messagesCount}\``, inline: true },
                { name: locale.statsEmbed.voiceTime, value: `\`${aproxVoiceTime}\``, inline: true },
                { name: locale.statsEmbed.antiquity, value: `\`${await client.functions.utils.msToTime(Date.now() - member.joinedTimestamp)}\``, inline: true },
                { name: locale.statsEmbed.nextRewards, value: notAuthorizedToEarnXp ? `\`${locale.statsEmbed.noNextRewards}\`` : `\`${nextRewards}\``, inline: true }
            )
        ]});

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: false
            }
        ]
    }
};

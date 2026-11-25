export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores the chosen subcommand
        const subcommand = interaction.options._subcommand;

        // Stores the options of the subcommand: the user, and the quantity (if it has one)
        const userOption = interaction.options._hoistedOptions.find(option => option.type === discord.ApplicationCommandOptionType.User);
        const valueOption = interaction.options._hoistedOptions.find(option => option.type === discord.ApplicationCommandOptionType.Integer);

        // Stores the member provided
        const member = await client.functions.utils.fetch('member', userOption.value);

        // Checks if a valid member has been provided
        if (!member && !await client.functions.db.getData('profile', userOption.value)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidMember}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores the member Id
        const memberId = member ? member.id : userOption.value;

        // If the member was a bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores the value for its modification
        const providedValue = valueOption ? valueOption.value : null;

        // Stores the member's profile, or creates it
        let memberProfile = await client.functions.db.getData('profile', memberId) || await client.functions.db.genData('profile', { userId: memberId });

        // Stores the member statistics
        let memberStats = memberProfile.stats;

        // Checks if that amount can be subtracted from the member
        if (subcommand === locale.appData.options.remove.name && memberStats.experience < providedValue) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidQuantity}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Checks if the XP can be removed from the member
        if (subcommand === locale.appData.options.clear.name && memberStats.experience === 0) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.hasNoXp}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores if the hierarchy check is omitted
        const byPassed = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true });

        // If it was not omitted and the role of the member is greater than or equal to that of the executor
        if (!byPassed && member && interaction.member.roles.highest.position <= member.roles.highest.position) {

            // Returns an error message
            return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.unauthorizedModify}.`)
            ], flags: discord.MessageFlags.Ephemeral});
        };
        
        // Variables are declared to store the amounts of XP (old and new) and the modified level
        let oldValue = memberStats.experience, newValue = 0, newLevel = memberStats.level;

        // Executes the operation indicated depending on the argument
        switch (subcommand) {

            // If has to set the amount of XP
            case locale.appData.options.set.name:

                // Stores the new XP
                memberStats.experience = parseInt(providedValue);

                // Stores the new XP value
                newValue = parseInt(providedValue);

                // Stops the switch
                break;

            // If has to add XP to the current amount
            case locale.appData.options.add.name:

                // Stores the new XP
                memberStats.experience = parseInt(oldValue) + parseInt(providedValue);

                // Stores the new XP value
                newValue = parseInt(oldValue) + parseInt(providedValue);

                // Stops the switch
                break;

            // If has to add random XP to the current amount
            case locale.appData.options.addrandom.name:

                // Stores the XP to add
                let generatedXp = 0;

                // According to the parameter provided
                for (let remaining = providedValue; remaining > 0; remaining--) {

                    // Generates random XP and updates the total variable
                    generatedXp += await client.functions.utils.randomIntBetween(await client.functions.db.getConfig('leveling.minimumXpReward'), await client.functions.db.getConfig('leveling.maximumXpReward'));
                };

                // Stores the new XP
                memberStats.experience = parseInt(oldValue) + parseInt(generatedXp);

                // Stores the new XP value
                newValue = parseInt(oldValue) + parseInt(generatedXp);

                // Stops the switch
                break;

            // If has to remove XP from the current amount
            case locale.appData.options.remove.name:

                // Stores the new XP
                memberStats.experience = parseInt(oldValue) - parseInt(providedValue);

                // Stores the new XP value
                newValue = parseInt(oldValue) - parseInt(providedValue);

                // Stops the switch
                break;

            // If has to empty the entire XP
            case locale.appData.options.clear.name:

                // Updates the total XP of the member
                memberStats.experience = 0;

                // Stops the switch
                break;
        };

        // Stores the level corresponding to the specified XP
        const neededExperience = await client.functions.leveling.getNeededExperience(newValue);

        // Stores the new member level
        newLevel = neededExperience.nextLevel;

        // If the level has been modified
        if (newLevel !== memberStats.level) {

            // Records the new level of the member
            memberStats.level = newLevel;

            // Assigns the rewards of the level to the member (and deletes those that do not correspond), if it is in the guild
            if (member) await client.functions.leveling.assignRewards(member, newLevel, true);
        };

        // Saves the new statistics of the member in the database
        await client.functions.db.setData('profile', memberId, memberProfile);

        // Sends a message to the records channel
        await client.functions.managers.sendLog('experienceModified', 'embed',  new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
            .setTitle(`📑 ${locale.loggingEmbed.title}`)
            .setDescription(`${await client.functions.utils.parseLocale(locale.loggingEmbed.description, { memberTag: member ? member.user.tag : memberId })}.`)
            .addFields(
                { name: locale.loggingEmbed.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                { name: locale.loggingEmbed.moderator, value: interaction.user.tag, inline: true },
                { name: locale.loggingEmbed.memberId, value: memberId.toString(), inline: true },
                { name: locale.loggingEmbed.oldValue, value: oldValue.toString(), inline: true },
                { name: locale.loggingEmbed.newValue, value: newValue.toString(), inline: true }
            )
        );

        // Notifies the action in the invocation channel
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
            .setDescription(`${client.customEmojis.greenTick} ${await client.functions.utils.parseLocale(locale.notificationEmbed, { memberTag: member ? member.user.tag : memberId })}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Aborts if the member is no longer in the guild, as it can not be notified
        if (!member) return;

        try {

            // If XP have been emptied to the member
            if (newValue === 0) {
    
                // Sends the member a notification by private message
                await member.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                    .setAuthor({ name: locale.privateEmbed.reset.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                    .setDescription(`${await client.functions.utils.parseLocale(locale.privateEmbed.reset.description, { moderatorTag: interaction.user.tag })}.`)
                ]});
    
            // If XP have been increased to the member
            } else if (newValue > oldValue) {
    
                // Sends the member a notification by private message
                await member.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                    .setAuthor({ name: locale.privateEmbed.increased.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                    .setDescription(`${await client.functions.utils.parseLocale(locale.privateEmbed.increased.description, { moderatorTag: interaction.user.tag, givenExp: providedValue, newXP: newValue.toString() })}.`)
                ]});
    
            // If the XP has been reduced to the member
            } else if (newValue < oldValue) {
    
                // Sends the member a notification by private message
                await member.send({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                    .setAuthor({ name: locale.privateEmbed.decreased.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                    .setDescription(`${await client.functions.utils.parseLocale(locale.privateEmbed.decreased.description, { moderatorTag: interaction.user.tag, removedXP: providedValue, newXP: newValue.toString() })}.`)
                ]});
            };

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "changed xp" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else logger.error(error.stack);
        };
        
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
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'set',
                type: discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        optionName: 'user',
                        type: discord.ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        optionName: 'quantity',
                        type: discord.ApplicationCommandOptionType.Integer,
                        required: true,
                        minValue: 0
                    }
                ]
            },
            {
                optionName: 'add',
                type: discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        optionName: 'user',
                        type: discord.ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        optionName: 'quantity',
                        type: discord.ApplicationCommandOptionType.Integer,
                        required: true,
                        minValue: 1
                    }
                ]
            },
            {
                optionName: 'addrandom',
                type: discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        optionName: 'user',
                        type: discord.ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        optionName: 'times',
                        type: discord.ApplicationCommandOptionType.Integer,
                        required: true,
                        minValue: 1,
                        maxValue: 1000
                    }
                ]
            },
            {
                optionName: 'remove',
                type: discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        optionName: 'user',
                        type: discord.ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        optionName: 'quantity',
                        type: discord.ApplicationCommandOptionType.Integer,
                        required: true,
                        minValue: 1
                    }
                ]
            },
            {
                optionName: 'clear',
                type: discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        optionName: 'user',
                        type: discord.ApplicationCommandOptionType.User,
                        required: true
                    }
                ]
            }
        ]
    }
};

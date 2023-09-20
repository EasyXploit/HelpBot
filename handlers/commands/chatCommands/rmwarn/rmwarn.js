export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the member provided
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        // Stores the member Id
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        // Returns an error if a bot has been provided
        if (member && member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        // Checks if any warning has been provided
        const warnIdOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.warn.name);
        const warnId = warnIdOption ? warnIdOption.value : null;

        // Stores the reason and capitalizes it, if it has been provided
        const reasonOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.reason.name);
        const reason = reasonOption ? `${reasonOption.value.charAt(0).toUpperCase()}${reasonOption.value.slice(1)}` : null;

        // If a reason has not been provided and the member is not the owner
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            // Stores if the member can omit the reason
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            // If the member is not authorized, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };
        
        // It is checked if the role of the executing member is lower than that of the target member
        if (member && interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});
        
        // Stores the member's profile
        let memberProfile = await client.functions.db.getData('profile', member.id);

        // Checks if the member has warns
        if (!memberProfile || memberProfile.moderationLog.warnsHistory.length === 0) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noWarns}`)
        ], ephemeral: true});

        // Stores the member's warnings
        let memberWarns = memberProfile.moderationLog.warnsHistory;

        // Stores if the member can erase anyone
        const canRemoveAny = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.removeAny});

        // Creates variables to stores the embeds to send
        let successEmbed, loggingEmbed, toDMEmbed;

        // If has to delete all the infractions
        if (!warnId) {

            // Checks if the member can delete any warning
            if (!canRemoveAny) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantRemoveAny}.`)
            ], ephemeral: true});

            // Generates a message for the records channel
            loggingEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.loggingEmbedAll.title}`)
                .setDescription(locale.loggingEmbedAll.description)
                .addFields(
                    { name: locale.loggingEmbedAll.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbedAll.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbedAll.reason, value: reason || locale.undefinedReason, inline: true },
                    { name: locale.loggingEmbedAll.memberId, value: memberId.toString(), inline: true }
                );

            // Generates a notification of the action for the invocation channel
            successEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedAll.title}`)
                .setDescription(await client.functions.utils.parseLocale(locale.notificationEmbedAll.description, { member: member ? member.user.tag : `${memberId} (ID)` }));

            // If the member was found, adds his tag to the register
            member ? loggingEmbed.addFields({ name: locale.loggingEmbedAll.member, value: member.user.tag, inline: true }) : null;

            // Generates a notification for the member
            if (member) toDMEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor({ name: locale.privateEmbedAll.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbedAll.description, { member: member }))
                .addFields(
                    { name: locale.privateEmbedAll.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbedAll.reason, value: reason || locale.undefinedReason, inline: true }
                );

            // Empties the array of warnings
            memberProfile.moderationLog.warnsHistory = [];

            // Updates the database with the changes
            await client.functions.db.setData('profile', memberId, memberProfile);

        } else { // If only has to delete an infraction

            // Stores the warning, if found
            let foundWarn = false;

            // For each of the warnings of the member
            for (let index = 0; index < memberWarns.length; index++) {

                // If the Id matches the search
                if (memberWarns[index].warnId === warnId) {

                    // Stores the warning
                    foundWarn = memberWarns[index];

                    // Deletes the entry of the list
                    memberWarns.splice(index, 1);

                    // Stops the loop
                    break;
                };
            };

            // Sends an error message if the warning was not found
            if (!foundWarn) return interaction.reply({ embeds: [new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.warnNotFound, { warnId: warnId })}`)
            ], ephemeral: true});

            // Checks if can erase this warning
            if ((foundWarn.executor.type === 'system' || foundWarn.executor.memberId !== interaction.member.id) && !canRemoveAny) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantRemoveAny}.`)
            ], ephemeral: true});

            // Generates a message for the records channel
            loggingEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.loggingEmbedSingle.title}`)
                .setDescription(locale.loggingEmbedSingle.description)
                .addFields(
                    { name: locale.loggingEmbedSingle.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbedSingle.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbedSingle.warnId, value: warnId, inline: true },
                    { name: locale.loggingEmbedSingle.warn, value: foundWarn.reason, inline: true },
                    { name: locale.loggingEmbedSingle.reason, value: reason || locale.undefinedReason, inline: true },
                    { name: locale.loggingEmbedSingle.memberId, value: memberId.toString(), inline: true }
                );

            // Generates a notification of the action for the invocation channel
            successEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedSingle.title}`)
                .setDescription(await client.functions.utils.parseLocale(locale.notificationEmbedSingle.description, { warnId: warnId, member: member ? member.user.tag : `${memberId} (ID)` }));

            // If the member was found, adds his tag to the record
            member ? loggingEmbed.addFields({ name: locale.loggingEmbedSingle.member, value: member.user.tag, inline: true }) : null;

            // Generates a notification for the member
            if (member) toDMEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor({ name: locale.privateEmbedSingle.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbedSingle.description, { member: member, warnId: warnId }))
                .addFields(
                    { name: locale.privateEmbedSingle.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbedSingle.warnId, value: warnId, inline: true },
                    { name: locale.privateEmbedSingle.warn, value: foundWarn.reason, inline: true },
                    { name: locale.privateEmbedSingle.reason, value: reason || locale.undefinedReason, inline: true }
                );

            // Updates the database with the changes
            await client.functions.db.setData('profile', member.id, memberProfile);
        };

        // Sends a record to the records channel
        await client.functions.managers.sendLog('warnRemoved', 'embed', loggingEmbed);

        // Sends a notification of the action on the invocation channel
        await interaction.reply({ embeds: [successEmbed] });

        try {

            // Sends a confirmation message to the member
            if (member) await member.send({ embeds: [toDMEmbed] });

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "removed warn log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else logger.error(error.stack);
        };
        
    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

// Exports the autocomplete function
export async function autocomplete(interaction, command, locale) {

    try {

        // Stores the target member Id
        const memberId = interaction.options._hoistedOptions[0].value;

        // Stores the partial value that the user has introduced
        const focusedValue = interaction.options.getFocused();

        // Stores the member's profile
        let memberProfile = await client.functions.db.getData('profile', memberId);

        // Stores the member's warnings
        let memberWarns = memberProfile ? memberProfile.moderationLog.warnsHistory : null;
        
        // Sends an empty list if the user does not have warns
        if (!memberWarns || memberWarns.length === 0) return await interaction.respond([]);

        // Stores if the member can erase any warning
        const canRemoveAny = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: command.userConfig.removeAny});

        // Stores warnings in reverse chronological manner
        const reversedWarns = memberWarns.reverse();

        // Creates an object to store the mapped and ordered warns
        const sortedWarnsObject = {};

        // For each of the warns of the chronologically ordered warns array
        for (const warnData of reversedWarns) {

            // Omits this warning if it was not issued by the executor of the command, and has no permission to delete all
            if (!canRemoveAny && (warnData.executor.type === 'system' || warnData.executor.memberId !== interaction.member.id)) continue;

            // Generates a date from the warning
            const warnDate = new Date(warnData.timestamp);
    
            // Gets a string from the warning date
            const dateString = `${warnDate.getDate()}/${warnDate.getMonth() + 1}/${warnDate.getFullYear()} ${warnDate.getHours()}:${warnDate.getMinutes()}:${warnDate.getSeconds()}`;

            // Gets the warning moderator, or a generic string
            const moderatorUser = warnData.executor.type === 'system' ? locale.autocomplete.systemModerator : await client.functions.utils.fetch('user', warnData.executor.memberId) || locale.autocomplete.unknownModerator;

            // Generates a string to show it as a result
            let warnString = `${warnData.warnId} • ${moderatorUser.tag ? moderatorUser.tag : moderatorUser} • ${dateString} • ${warnData.reason}`;

            // Cuts the string if necessary
            warnString = warnString.length > 100 ? `${warnString.slice(0, 96)} ...` : warnString;

            // If no value has been provided, or the provided partial fits, stores it in the warns object
            if (focusedValue.length === 0 || warnString.toLowerCase().includes(focusedValue.toLowerCase())) sortedWarnsObject[warnData.warnId] = warnString;
        };

        // Generates an array mapped from the object of warns
        const arrayOfWarns = Object.entries(sortedWarnsObject).map((entry) => ( { [entry[0]]: entry[1] } ));

        // Maps the array of warnings in a name-value manner
        let mappedList = arrayOfWarns.map(warn => ({ name: Object.values(warn)[0], value: Object.keys(warn)[0] }));

        // Cuts the list if it's too big
        mappedList = mappedList.slice(0, 25);

        // Responds to the interaction with the list
        await interaction.respond(mappedList);

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
    defaultMemberPermissions: new discord.PermissionsBitField('ModerateMembers'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: true
            },
            {
                optionName: 'warn',
                type: discord.ApplicationCommandOptionType.String,
                required: false,
                autocomplete: true
            },
            {
                optionName: 'reason',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};

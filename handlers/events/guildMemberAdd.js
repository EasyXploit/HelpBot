// Exports the event management function
export default async (member, locale) => {
    
    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (member.guild.id !== client.baseGuild.id) return;

        // Stores the member's timeout
        const memberTimeout = await client.functions.db.getData('timeout', member.id);

        // If the member has a timeout in progress and must be withdrawn, or does not have it and must be deregistered
        if ((member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() && !memberTimeout) || (!member.communicationDisabledUntilTimestamp && memberTimeout)) {

            // Checks if the bot has the required permissions
            const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ModerateMembers']);
            if (missingPermissions) return logger.warn(`The bot could not un-timeout ${member.user.tag} (${member.id}) because it did not have permission to do so`);

            // Enables member's communication on the server
            await member.disableCommunicationUntil(null, locale.communicationEnabled.reason);

            // If has a registered timeout
            if (memberTimeout) {

                // Deletes the database entry
                await client.functions.db.delData('timeout', member.id);
            };
        };

        // If the new member is a bot
        if (member.user.bot) {

            // Stores the role of role for new bots
            const newBotRoleId = await client.functions.db.getConfig('welcomes.newBotRoleId');

            // If there is a configured role
            if (newBotRoleId && newBotRoleId.length > 0) {

                // Checks if the bot has the required permissions
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);
                if (missingPermissions) logger.warn(`The bot could not add the welcome role to the bot ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else if (!member.roles.cache.has(newBotRoleId)) await member.roles.add(newBotRoleId); // Adds the welcome role for new bots (if don't have it already)
            };

            // Sends a message to the records channel
            await client.functions.managers.sendLog('botJoined', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.botLoggingEmbed.description, { memberTag: member.user.tag })}.`)
            );

            // Aborts the rest of the script
            return;
        };
        
        // Stores the new members management mode
        const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');

        // Executes the new members manager (if applicable)
        if (newMemberMode === 0) await client.functions.managers.newMember(member);

    } catch (error) {

        // Invokes the error handler
        await client.functions.managers.eventError(error);
    };
};

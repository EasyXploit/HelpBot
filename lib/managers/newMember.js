// Function to manage new members: when recovering the joins that happened while the bot was offline, the welcome messages are only sent if their recovery is enabled
export default async (member, { recovered = false, publicRecoveryAllowed = false } = {}) => {

    // Stores the translations
    const locale = client.locale.lib.managers.newMember;

    try {

        // Stores the greetings module status
        const greetingsModuleEnabled = await client.functions.db.getConfig('system.modules.greetings');

        // If the new member is a bot
        if (member.user.bot) {

            // Aborts if the greetings module is disabled
            if (!greetingsModuleEnabled) return;

            // Stores the role for new bots
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

            // Aborts the rest of the function
            return;
        };

        // Stores the moderation module status
        const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

        // If has to kick to the members with a prohibited username
        if (moderationModuleEnabled && await client.functions.db.getConfig('moderation.kickOnBadUsername')) {

            // Checks if the member's name is valId
            const usernameIsValid = await client.functions.moderation.checkUsername(member);

            // Aborts if the name was not valId
            if (!usernameIsValid) return;
        };

        // Aborts if the greetings module is disabled
        if (!greetingsModuleEnabled) return;

        // Stores the role Id for new members
        const newMemberRoleId = await client.functions.db.getConfig('welcomes.newMemberRoleId');

        // If there is a configured welcome role and the member does not have it
        if (newMemberRoleId && newMemberRoleId.length > 0 && !member.roles.cache.has(newMemberRoleId)) {

            // Checks if the bot has the required permissions
            const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);
            if (missingPermissions) logger.warn(`The bot could not add the welcome role to the member ${member.user.tag} (${member.id}) because it did not have permission to do so`);
            else await member.roles.add(newMemberRoleId); // Adds the role to the member
        };

        // Generates an embed with the welcome record
        let welcomeEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setThumbnail(member.user.displayAvatarURL())
            .setAuthor({ name: locale.author, iconURL: 'attachment://in.png' })
            .setDescription(await client.functions.utils.parseLocale(locale.description, { memberTag: member.user.tag }))
            .addFields(
                { name: `🆔 ${locale.memberId}`, value: member.user.id, inline: true },
                { name: `📝 ${locale.registerDate}`, value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true }
            );

        // Checks if the member is timeouted, and adds the field to the records embed (if applicable)
        if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) welcomeEmbed.addFields({ name: `🔇 ${locale.actualSanction}`, value: `${locale.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>`, inline: false });

        // If the join is being recovered, indicates it and when the member joined
        if (recovered) welcomeEmbed.setFooter({ text: locale.recovered }).setTimestamp(member.joinedTimestamp);

        // Notifies on the records channel
        await client.functions.managers.sendLog('memberJoined', 'embed', welcomeEmbed, ['./assets/images/in.png']);

        // Stores the settings of the public and private welcomes
        const publicWelcome = await client.functions.db.getConfig('welcomes.publicWelcome');
        const privateWelcome = await client.functions.db.getConfig('welcomes.privateWelcome');

        // Sends the public welcome, if enabled (and its recovery is allowed, if the join is being recovered)
        if (publicWelcome.enabled && (!recovered || publicRecoveryAllowed)) await client.functions.managers.sendWelcomeMessage(member, 'public');

        // Sends the private welcome, if enabled (and its recovery is enabled, if the join is being recovered)
        if (privateWelcome.enabled && (!recovered || privateWelcome.recovery)) await client.functions.managers.sendWelcomeMessage(member, 'private');

    } catch (error) {

        // Shows the error in the console
        logger.error(error.stack);
    };
};

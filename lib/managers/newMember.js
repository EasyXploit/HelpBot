// Function to manage new members
export default async (member) => {

    // Stores the translations
    const locale = client.locale.lib.managers.newMember;

    try {

        // Stores the moderation module status
        const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

        // If has to kick to the members with a prohibited username
        if (moderationModuleEnabled && await client.functions.db.getConfig('moderation.kickOnBadUsername')) {

            // Checks if the member's name is valId
            const usernameIsValid = await client.functions.moderation.checkUsername(member);

            // Aborts if the name was not valId
            if (!usernameIsValid) return;
        };

        // Stores the greetings module status
        const greetingsModuleEnabled = await client.functions.db.getConfig('system.modules.greetings');

        // If the greetings module is enabled
        if (greetingsModuleEnabled) {

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
            if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) welcomeEmbed.addFieldw({ name: `🔇 ${locale.actualSanction}`, value: `${locale.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>`, inline: false });
    
            // Notifies on the records channel
            await client.functions.managers.sendLog('memberJoined', 'embed', welcomeEmbed, ['./assets/images/in.png']);
    
            // Stores the role Id for new members
            const newMemberRoleId = await client.functions.db.getConfig('welcomes.newMemberRoleId');
    
            // If there is a configured welcome role and the member does not have it
            if (newMemberRoleId && newMemberRoleId.length > 0 && member.roles.cache.has(newMemberRoleId)) {
    
                // Checks if the bot has the required permissions
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);
                if (missingPermissions) logger.warn(`The bot could not add the welcome role to the member ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else await member.roles.add(newMemberRoleId); // Adds the role to the member
            };
        };

    } catch (error) {

        // Shows the error in the console
        logger.error(error.stack);
    };
};

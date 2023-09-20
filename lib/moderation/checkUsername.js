// Function to check the usernames of the members
export default async (member) => {

    // Stores the translations
    const locale = client.locale.lib.moderation.checkUsername;

    // Stores the prohibited words lists
    const forbiddenNames = await client.functions.db.getConfig('moderation.newMemberForbiddenNames');
    const bannedWords = await client.functions.db.getConfig('moderation.bannedWords');

    // Checks if usernames have to be checked
    const containsForbiddenNames = forbiddenNames.some(word => member.displayName.toLowerCase().includes(word));
    const containsBannedWords = await client.functions.db.getConfig('moderation.includeBannedWords') ? bannedWords.some(word => member.displayName.toLowerCase().includes(word)) : false;

    // If it contains any prohibited word
    if (containsForbiddenNames || containsBannedWords) {

        // Checks if the bot is missing permissions
        const missingPermissions = await client.functions.utils.missingPermissions(null, logChannel.guild.members.me, ['KickMembers'], true);

        // If missed permissions
        if (missingPermissions) {

            // Warns through the console that there are no permissions
            logger.warn(`Cannot kick the member ${member.user.tag} (${member.id}) due to a bad username. The bot must have the following permissions on the server: ${missingPermissions}`);

            // Returns a validated state
            return true;
        };

        // If there is no records cache
        if (!client.loggingCache) client.loggingCache = {};

        // Creates a new entry in the records cache
        client.loggingCache[member.id] = {
            action: 'kick',
            executor: client.user.id,
            reason: locale.kickReason
        };

        try {
        
            // Alerts to the member that has been kicked
            await member.user.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: member.guild.iconURL({dynamic: true}) })
                .setDescription(`${await client.functions.utils.parseLocale(locale.privateEmbed.description, { member: member, guildName: member.guild.name })}.`)
                .addFields(
                    { name: locale.privateEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.privateEmbed.reasonTitle, value: `${locale.privateEmbed.reasonDescription}.`, inline: true }
                )
            ]});

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "kick log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else logger.error(error.stack);
        };

        // The member is kicked
        await member.kick(member.user, { reason: locale.kickReason });

        // Returns "false"
        return false;
    };

    // Returns "true"
    return true;
};
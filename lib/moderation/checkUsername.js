// Function to check the usernames of the members
export default async (member) => {

    // Stores the translations
    const locale = client.locale.lib.moderation.checkUsername;

    // Omits the bots, the owner of the server and the members that the bot cannot kick (due to the hierarchy)
    if (member.user.bot || member.id === member.guild.ownerId || !member.kickable) return true;

    // Stores the prohibited words lists (in lowercase, and without empty words)
    const forbiddenNames = (await client.functions.db.getConfig('moderation.newMemberForbiddenNames') || []).map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
    const bannedWords = (await client.functions.db.getConfig('moderation.bannedWords') || []).map(word => word.trim().toLowerCase()).filter(word => word.length > 0);

    // Stores the visible name of the member, in lowercase
    const displayName = member.displayName.toLowerCase();

    // Checks if usernames have to be checked
    const containsForbiddenNames = forbiddenNames.some(word => displayName.includes(word));
    const containsBannedWords = await client.functions.db.getConfig('moderation.includeBannedWords') ? bannedWords.some(word => displayName.includes(word)) : false;

    // If it contains any prohibited word
    if (containsForbiddenNames || containsBannedWords) {

        // Checks if the bot is missing permissions
        const missingPermissions = await client.functions.utils.missingPermissions(null, member.guild.members.me, ['KickMembers'], true);

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
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "kick log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else logger.error(error.stack);
        };

        try {

            // The member is kicked
            await member.kick(locale.kickReason);

        } catch (error) {

            // Deletes the entry of the records cache, as the member was not kicked
            delete client.loggingCache[member.id];

            // Warns through the console, and returns a validated state
            logger.warn(`Cannot kick the member ${member.user.tag} (${member.id}) due to a bad username: ${error.message}`);
            return true;
        };

        // Returns "false"
        return false;
    };

    // Returns "true"
    return true;
};
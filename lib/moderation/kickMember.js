// Function to kick a member, notifying it through a private message (the "guildMemberRemove" event sends the record)
export default async (member, { moderator, reason }) => {

    // Stores the translations of the kick command, and the final reason
    const locale = client.locale.handlers.commands.chatCommands.kick;
    const finalReason = reason || locale.undefinedReason;

    // Creates an entry in the records cache, so the record shows the moderator and the reason
    if (!client.loggingCache) client.loggingCache = {};
    client.loggingCache[member.id] = { action: 'kick', executor: moderator.id, reason: finalReason };

    try {

        // Sends a notification to the member
        await member.send({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { member: member, guildName: member.guild.name }))
            .addFields(
                { name: locale.privateEmbed.moderator, value: moderator.tag, inline: true },
                { name: locale.privateEmbed.reason, value: finalReason, inline: true }
            )
        ]});

    } catch (error) {

        // Handles the errors that occur when a private message cannot be delivered
        if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "kick log" message to @${member.user.username} (${member.id}) due to an API restriction`);
        else logger.error(error.stack);
    };

    try {

        // Kicks the member
        await member.kick(finalReason);

    } catch (error) {

        // Deletes the entry of the records cache, as the member was not kicked, and throws the error
        delete client.loggingCache[member.id];
        throw error;
    };
};

// Function to ban a user, temporarily if a duration is provided, notifying it through a private message if it is a member (the "guildBanAdd" event sends the record)
export default async (user, { moderator, reason, duration, deletedDays }) => {

    // Stores the translations of the ban command, and the final reason
    const locale = client.locale.handlers.commands.chatCommands.ban;
    const finalReason = reason || locale.undefinedReason;

    // Stores the moment in which the ban expires, if it is temporary
    const expiration = duration ? Date.now() + duration : null;

    // Creates an entry in the records cache, so the record shows the moderator, the reason, the expiration and the deleted days
    if (!client.loggingCache) client.loggingCache = {};
    client.loggingCache[user.id] = { action: 'ban', executor: moderator.id, reason: finalReason, deletedDays: deletedDays ? deletedDays.toString() : null, expiration: expiration };

    // If the ban is temporary, records it in the database (updating the previous record, if any)
    if (duration) {
        if (await client.functions.db.getData('ban', user.id)) await client.functions.db.setData('ban', user.id, { moderatorId: moderator.id, untilTimestamp: expiration });
        else await client.functions.db.genData('ban', { userId: user.id, moderatorId: moderator.id, untilTimestamp: expiration });
    };

    // If the user is a member of the guild, sends a notification to it
    if (await client.functions.utils.fetch('member', user.id)) {

        try {

            // Sends the notification
            await user.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: client.baseGuild.iconURL({ dynamic: true }) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { user: user, guildName: client.baseGuild.name }))
                .addFields(
                    { name: locale.privateEmbed.moderator, value: moderator.tag, inline: true },
                    { name: locale.privateEmbed.reason, value: finalReason, inline: true },
                    { name: locale.privateEmbed.expiration, value: expiration ? `<t:${Math.round(expiration / 1000)}:R>` : locale.privateEmbed.noExpiration, inline: true },
                    { name: locale.privateEmbed.deletedDays, value: deletedDays ? deletedDays.toString() : `\`${locale.privateEmbed.noDeletedDays}\``, inline: true }
                )
            ]});

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver the "ban log" message to @${user.username} (${user.id}) due to an API restriction`);
            else logger.error(error.stack);
        };
    };

    try {

        // Bans the user (deleting its messages of the provided days, if any)
        await client.baseGuild.members.ban(user, { reason: finalReason, ...(deletedDays ? { deleteMessageSeconds: deletedDays * 24 * 60 * 60 } : {}) });

    } catch (error) {

        // Deletes the entry of the records cache and the record of the ban, as the user was not banned, and throws the error
        delete client.loggingCache[user.id];
        if (duration) await client.functions.db.delData('ban', user.id);
        throw error;
    };
};

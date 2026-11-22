// Function to send the public (to a channel) or private (by private message) welcome message to a member
export default async (member, type) => {

    // Stores the translations
    const locale = client.locale.lib.managers.sendWelcomeMessage;

    // Stores the settings of this type of welcome
    const settings = await client.functions.db.getConfig(`welcomes.${type}Welcome`);

    // Stores the custom message, or the default one if there is none
    const template = settings.message && settings.message.length > 0 ? settings.message : locale.defaultMessages[type];

    // Replaces the line breaks and the wildcards of the message
    const text = template
        .replaceAll('\\n', '\n')
        .replaceAll('{memberMention}', `<@${member.id}>`)
        .replaceAll('{userName}', member.user.username)
        .replaceAll('{serverName}', member.guild.name)
        .replaceAll('{memberCount}', member.guild.memberCount.toString());

    // Generates the content of the message, depending on the chosen format (only the member can be mentioned)
    const payload = { allowedMentions: { users: [member.id] } };

    // If the message is an embed
    if (settings.format === 'embed') {

        // Generates the embed
        const embed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(text.slice(0, 4096));

        // If it is a private message, shows the guild it comes from
        if (type === 'private') embed.setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() || undefined });

        // Stores the embed
        payload.embeds = [embed];

    } else {

        // Stores the text
        payload.content = text.slice(0, 2000);
    };

    // If it is a public welcome
    if (type === 'public') {

        // If there is no channel configured, warns and aborts
        if (!settings.channelId || settings.channelId.length === 0) return logger.warn('The public welcome could not be sent because there is no channel configured for it');

        // Looks for the channel
        const channel = await client.functions.utils.fetch('channel', settings.channelId);

        // If the channel is not found, warns and aborts
        if (!channel) return logger.warn('Cannot access the public welcome channel, so the welcome could not be sent');

        // Checks if the bot is missing permissions in the channel
        const missingPermissions = await client.functions.utils.missingPermissions(channel, channel.guild.members.me, settings.format === 'embed' ? ['SendMessages', 'EmbedLinks'] : ['SendMessages'], true);

        // If the bot missed permissions, warns and aborts
        if (missingPermissions) return logger.warn(`Cannot send the public welcome to #${channel.name}. The bot must have the following permissions on the channel: ${missingPermissions}`);

        // Sends the welcome to the channel
        await channel.send(payload);

    } else {

        try {

            // Sends the welcome to the member
            await member.send(payload);

        } catch (error) {

            // Ignores the members that do not accept private messages, and warns about the rest of errors
            if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot could not send the private welcome to @${member.user.username} (${member.id}): ${error.message}`);
        };
    };
};

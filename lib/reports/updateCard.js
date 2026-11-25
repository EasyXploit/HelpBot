// Function to send or update the message of a report in the reports channel (returns whether it could be done)
export default async (report, { isNew = false } = {}) => {

    // Generates the message of the report
    const payload = await client.functions.reports.renderReport(report);

    // If the report already has a message in the reports channel, tries to edit it
    if (report.card && report.card.messageId) {

        // Looks for the channel and the message
        const cardChannel = await client.functions.utils.fetch('channel', report.card.channelId);
        const cardMessage = cardChannel ? await client.functions.utils.fetch('message', report.card.messageId, cardChannel) : null;

        // If it was found, edits it and returns
        if (cardMessage) {
            await cardMessage.edit(payload);
            return true;
        };
    };

    // Stores the settings of the reports
    const reportsConfig = await client.functions.db.getConfig('moderation.reports');

    // Looks for the reports channel
    const reportsChannel = reportsConfig.channelId && reportsConfig.channelId.length > 0 ? await client.functions.utils.fetch('channel', reportsConfig.channelId) : null;

    // If the channel is not configured or could not be found, warns about it and returns
    if (!reportsChannel) {
        logger.warn('A report could not be delivered, because the reports channel is not configured or could not be found');
        return false;
    };

    // If the bot does not have the necessary permissions in the channel, warns about it and returns
    const missingPermissions = await client.functions.utils.missingPermissions(reportsChannel, reportsChannel.guild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles'], true);
    if (missingPermissions) {
        logger.warn(`A report could not be delivered to the reports channel (#${reportsChannel.name}). The bot must have the following permissions on the channel: ${missingPermissions}`);
        return false;
    };

    // If the reported message is too long to be shown in the report, attaches it as a file
    const content = report.message && report.message.content ? report.message.content : '';
    if (content.length > 1024) payload.files = [ new discord.AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: `message-${report.message.id}.txt` }) ];

    // Stores the roles to mention (only if the report is new)
    const mentionRoles = isNew ? reportsConfig.mentionRoles || [] : [];

    // Sends the message of the report, mentioning the roles
    const cardMessage = await reportsChannel.send({ ...payload, content: mentionRoles.length > 0 ? mentionRoles.map(roleId => `<@&${roleId}>`).join(' ') : undefined, allowedMentions: { roles: mentionRoles } });

    // Stores the message in the report, and saves it
    report.card = { channelId: reportsChannel.id, messageId: cardMessage.id };
    await report.save();

    // Returns that it could be done
    return true;
};

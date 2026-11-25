// Function to send a private message to the members who made a report, which returns how many received it and how many did not
export default async (report, { title, description, fields = [] }) => {

    // Stores the translations
    const locale = client.locale.lib.reports.notifyReporters;

    // Generates the summary of what was reported
    const summary = report.message && report.message.id ? await client.functions.utils.parseLocale(locale.aboutMessage, { url: report.message.url }) : await client.functions.utils.parseLocale(locale.aboutMember, { member: `<@${report.target.userId}>` });

    // Generates the embed of the notification
    const notificationEmbed = new discord.EmbedBuilder()
        .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
        .setAuthor({ name: client.baseGuild.name, iconURL: client.baseGuild.iconURL() || undefined })
        .setTitle(title)
        .setDescription(client.functions.utils.truncate(description, 4096))
        .addFields({ name: locale.yourReport, value: summary, inline: false }, ...fields)
        .setFooter({ text: `ID: ${report.reportId}` });

    // Stores the amount of members who received the notification, and of the ones who did not
    let delivered = 0, notDelivered = 0;

    // For each of the members who made the report (only once each)
    for (const reporterId of [...new Set(report.reports.map(entry => entry.reporterId))]) {

        try {

            // Looks for the user, and sends the notification to it
            const reporter = await client.users.fetch(reporterId);
            await reporter.send({ embeds: [notificationEmbed] });
            delivered++;

        } catch (error) {

            // Counts it as not delivered, and logs the error if it was not because the user does not accept private messages
            notDelivered++;
            if (!error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot could not notify the reporter ${reporterId} of the report ${report.reportId}: ${error.message}`);
        };
    };

    // Returns the result
    return { delivered, notDelivered };
};

// Function to manage errors in interactions
export default async (error, interaction) => {

    // Stores the translations
    const locale = client.locale.lib.managers.interactionError;

    // It is checked if the error is caused by the invocation of an non-existing interaction, or because DM's cannot be sent
    if (error.toString().includes('Cannot find module') || error.toString().includes('Cannot send messages to this user')) return;

    // The error in console is shown
    logger.error(error.stack);

    // Sends the exception to the remote error handler
    client.errorTracker.captureException(error);
    
    // Stores if the bot has permission to use external emojis on the interaction channel
    const missingExtEmojisPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.members.me, ['UseExternalEmojis']);

    // Generates a notification embed
    const notificationEmbed = new discord.EmbedBuilder()
        .setColor(`${await client.functions.db.getConfig('colors.error')}`)
        .setTitle(`${missingExtEmojisPermissions ? '❌' : client.customEmojis.redTick} ${locale.notificationEmbed.title} ...`)
        .setDescription(locale.notificationEmbed.description);

    try {

        // Responds to the interaction with the embed
        await interaction.reply({ embeds: [notificationEmbed], ephemeral: true});

    } catch (error) {

        // Stores the interaction text channel
        const interactionChannel = await client.functions.utils.fetch('channel', interaction.channelId);

        // Stores if the bot has the necessary permissions in the interaction channel
        const missingPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.members.me, ['SendMessages', 'EmbedLinks']);

        // Sends the embed to the text channel, if there are permissions
        if (!missingPermissions) interactionChannel.send({ embeds: [notificationEmbed]});
    };
};
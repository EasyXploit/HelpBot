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
    
    // Aborts if it is an autocompletion, as it cannot be answered with a message
    if (interaction.isAutocomplete()) return;

    // Stores if the interaction was made in a channel of the guild (and not in private messages)
    const inGuildChannel = interaction.inGuild() && interaction.channel;

    // Stores if the bot has permission to use external emojis on the interaction channel
    const missingExtEmojisPermissions = inGuildChannel ? await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.members.me, ['UseExternalEmojis']) : false;

    // Generates a notification embed
    const notificationEmbed = new discord.EmbedBuilder()
        .setColor(`${await client.functions.db.getConfig('colors.error')}`)
        .setTitle(`${missingExtEmojisPermissions ? '❌' : client.customEmojis.redTick} ${locale.notificationEmbed.title} ...`)
        .setDescription(locale.notificationEmbed.description);

    try {

        // If the interaction was already answered, sends the embed as a private follow-up message
        if (interaction.replied) await interaction.followUp({ embeds: [notificationEmbed], flags: discord.MessageFlags.Ephemeral });

        // If the answer was deferred, replaces it with the embed (keeping its visibility)
        else if (interaction.deferred) await interaction.editReply({ content: null, embeds: [notificationEmbed], components: [] });

        // Otherwise, responds to the interaction with the embed
        else await interaction.reply({ embeds: [notificationEmbed], flags: discord.MessageFlags.Ephemeral });

    } catch (error) {

        // If the interaction could not be answered (for example, because it expired), and it was made in a channel of the guild
        if (inGuildChannel) {

            // Stores if the bot has the necessary permissions in the interaction channel
            const missingPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.members.me, ['SendMessages', 'EmbedLinks']);

            // Sends the embed to the text channel, if there are permissions
            if (!missingPermissions) await interaction.channel.send({ embeds: [notificationEmbed] }).catch(() => null);
        };
    };
};
// Function to synchronize the timeout of a member that joins the guild with the one registered in the database
export default async (member) => {

    // Stores the member's timeout
    const memberTimeout = await client.functions.db.getData('timeout', member.id);

    // If the member has a timeout in progress and must be withdrawn, or does not have it and must be deregistered
    if ((member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() && !memberTimeout) || (!member.communicationDisabledUntilTimestamp && memberTimeout)) {

        // Checks if the bot has the required permissions
        const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ModerateMembers']);
        if (missingPermissions) return logger.warn(`The bot could not un-timeout ${member.user.tag} (${member.id}) because it did not have permission to do so`);

        // Enables member's communication on the server
        await member.disableCommunicationUntil(null, client.locale.lib.moderation.syncTimeout.reason);

        // If has a registered timeout
        if (memberTimeout) {

            // Deletes the database entry
            await client.functions.db.delData('timeout', member.id);
        };
    };
};

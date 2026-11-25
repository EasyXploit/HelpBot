// Function to assess whether the bot or a member has a set of permissions in a channel or the guild
export default async (targetChannel, targetMember, requiredPermissions, defaultLocale) => {

    try {

        // Returns "false" if the required fields have not been provided
        if (!requiredPermissions) return false;

        // Stores the permissions translations, or their default version if specified
        const locale = defaultLocale ? require('./locales/en-US.json').permissions : client.locale.permissions;

        // Creates an array for permissions not available for the member
        let permissionsNotGranted = [];

        // Stores the member permissions on the target channel (taking into account its overwrites), or in the guild if no channel is provided
        const memberPermissions = targetChannel ? targetMember.permissionsIn(targetChannel) : targetMember.permissions;

        // For each of the required permissions
        for (const permission of requiredPermissions) {

            // If the member does not have that permission on the channel/guild, stores the translated permission (or without translating if it is not found)
            if (!memberPermissions.has(discord.PermissionsBitField.Flags[permission])) permissionsNotGranted.push(locale[permission] ? locale[permission] : client.functions.utils.capitalize(permission));
        };

        // If there were unavailable permissions, returns them
        if (typeof permissionsNotGranted !== 'undefined' && permissionsNotGranted.length > 0) return permissionsNotGranted;

        // Otherwise, returns "false"
        else return false;

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);
    };
};

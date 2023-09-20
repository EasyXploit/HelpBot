// Function to refresh the presence of bot
export default async () => {

    try {

        // Stores the translations
        const locale = client.locale.lib.managers.updatePresence;

        // Stores the presence configuration
        const presenceConfig = await client.functions.db.getConfig('presence');

        // Generates the new string for the activity
        const presenceName = (async () => {

            // Stores a string that will contain the text to show
            let showText = '';

            // If the member count is enabled
            if (presenceConfig.membersCount) {

                // Calculates the members that the guild has
                const membersCount = await client.baseGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size);

                // Concats the string translated into the result string
                showText += await client.functions.utils.parseLocale(locale.membersCount, { memberCount: membersCount });
            };

            // If the string will have two fields, adds a separator
            if (showText.length > 0 && presenceConfig.showText && presenceConfig.showText.length > 0) showText += ' | '; 

            // If there is additional text to show, concats it
            if (presenceConfig.showText && presenceConfig.showText.length > 0) showText += presenceConfig.showText;

            // Returns the result
            return showText;

        })();

        // Updates the presence of the bot
        await client.user.setPresence({
            status: presenceConfig.status,
            activities: [{
                name: await presenceName,
                type: presenceConfig.type
            }]
        });

    } catch (error) {

        // If the members could not be obtained due to a temporary error, aborts
        if (error.toString().includes('Members didn\'t arrive in time')) return;

        // Records the error
        logger.error(error.stack);
    };
};

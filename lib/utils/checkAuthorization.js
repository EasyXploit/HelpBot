// Function to check if a user is authorized to execute an action
export default async (member, authorizations) => {

    // Admissible parameters:
    //{ guildOwner: true, bypassIds: []}

    // Stores the authorization status
    let authorizationStatus = false;

    // For each of the parameters provided
    for (const parameter in authorizations) {

        // Stores the value of the parameter provided
        const parameterValue = authorizations[parameter];

        // If it's the "guildOwner" parameter and has a boolean value
        if (parameter === 'guildOwner' && typeof parameterValue == 'boolean') {

            // If the member is the owner of the guild, authorizes the operation and aborts the loop
            if (parameterValue === true && client.baseGuild.ownerId === member.id) return authorizationStatus = true;

        // If it is the "botManager" parameter and has a boolean value
        } else if (parameter === 'botManager' && typeof parameterValue == 'boolean') {

            // For every one of the Id's (from role or users) administrators of the bot
            for (const botManagerId of await client.functions.db.getConfig('system.botManagers')) {

                // If it is not a number, omits the iteration
                if (isNaN(botManagerId)) continue;

                // If the member's Id matches with the iterated Id, authorizes the operation and aborts the loop
                if (member.id === botManagerId) return authorizationStatus = true;

                // If the member has a role that matches with the iterated Id, authorizes the operation and aborts the loop
                if (member.roles.cache.some(role => role.id === botManagerId)) return authorizationStatus = true;
            };

        // If it is the "bypassIds" parameter and its value is an array with at least one item
        } else if (parameter === 'bypassIds' && Array.isArray(parameterValue) && parameterValue.length > 0) {

            // For each of the Id's (of role or user) who will have permission
            for (const bypassId of parameterValue) {

                // If everyone is allowed, authorizes the operation and aborts the loop
                if (bypassId === 'everyone') return authorizationStatus = true;

                // If it is not a number, omits the iteration
                if (isNaN(bypassId)) continue;

                // If the member's Id matches with the iterated Id, authorizes the operation and aborts the loop
                if (member.id === bypassId) return authorizationStatus = true;

                // If the member has a role that matches with the iterated Id, authorizes the operation and aborts the loop
                if (member.roles.cache.some(role => role.id === bypassId)) return authorizationStatus = true;
            };
        };

        // If the operation was already authorized, omits the rest of the loop
        if (authorizationStatus) break;
    };

    // Returns the status of authorization
    return authorizationStatus;
};

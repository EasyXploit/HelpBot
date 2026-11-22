// Function to get all the members of the base guild: from the cache, which is loaded at startup and kept updated by Discord, or from Discord if the cache could not be loaded completely
// It avoids requesting the full member list too often, as Discord only allows it once every 30 seconds
export default async () => {

    // If the cache does not have all the members yet
    if (!client.membersLoaded) {

        // Loads all the members in the cache
        await client.baseGuild.members.fetch();

        // Stores that all the members were loaded
        client.membersLoaded = true;
    };

    // Returns the members of the cache
    return client.baseGuild.members.cache;
};

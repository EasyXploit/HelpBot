// Exports a function to load the system emojis in a service guild
export async function loadEmojis() {

    try {

        // Searches and stores the service guild for emojis
        client.serviceGuild = client.guilds.cache.get(await client.functions.db.getConfig('system.serviceGuildId'));

        // If there is no service guild
        if (!client.serviceGuild) {

            // Creates and stores the service guild
            client.serviceGuild = await client.guilds.create({ name: `${client.user.username}-serviceGuild` });

            // Stores the Id of the service guild in the configuration
            await client.functions.db.setConfig('system.serviceGuildId', client.serviceGuild.id);
        };

        // Stores the original names of the emoji files
        let fileNames = fs.readdirSync('./assets/emojis/');

        // Stores the emoji names without extension
        let localEmojis = [];
        
        // For each file, stores its name without extension in the "localEmojis" array
        for (let file = 0; file < fileNames.length; file ++) localEmojis.push(fileNames[file].replace('.png', ''));

        // If the emojis limit is exceeded, returns an error
        if (localEmojis.length > 50) return logger.error('No more than 50 emojis can be loaded on the service guild');

        // Loads the guild emojis
        let remoteEmojis = await client.serviceGuild.emojis.fetch();

        // For each emoji of the guild
        await remoteEmojis.forEach(async emoji => {

            // If a local file for that emojis doesn't exist, the emoji is erased
            if (!localEmojis.includes(emoji.name)) await client.serviceGuild.emojis.delete(emoji);
        });

        // Stores the names of the guild emojis
        const remoteEmojiNames = remoteEmojis.map(emoji => emoji.name);

        // For each of the local emojis
        for (let index = 0; index < localEmojis.length; index++) {

            // Stores the name of the emoji
            const emojiName = localEmojis[index];

            // If the emoji is not in the guild, uploads it
            if (!remoteEmojiNames.includes(emojiName)) await client.serviceGuild.emojis.create({ attachment: `./assets/emojis/${emojiName}.png`, name: emojiName });
        };

        // Updates the guild emojis in memory
        remoteEmojis = await client.serviceGuild.emojis.fetch();

        // Creates an object to store the emojis in memory
        client.customEmojis = {};

        // For each of the guild emojis
        await remoteEmojis.forEach(emoji => {

            // Stores it in memory
            client.customEmojis[emoji.name] = emoji;
        });

        // Notifies the correct load of custom client emojis on the client
        logger.debug('Custom emojis loading completed');

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

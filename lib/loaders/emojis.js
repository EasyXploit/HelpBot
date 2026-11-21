// Exports a function to load the system emojis as application emojis
export async function loadEmojis() {

    try {

        // Stores the emoji names, from the names of their files without extension
        const localEmojis = fs.readdirSync('./assets/emojis/').filter(fileName => fileName.endsWith('.png')).map(fileName => fileName.replace('.png', ''));

        // Loads the application emojis
        const remoteEmojis = await client.application.emojis.fetch();

        // Stores the names of the application emojis
        const remoteEmojiNames = remoteEmojis.map(emoji => emoji.name);

        // For each of the local emojis
        for (const emojiName of localEmojis) {

            // If the application does not have the emoji yet, uploads it
            if (!remoteEmojiNames.includes(emojiName)) await client.application.emojis.create({ attachment: `./assets/emojis/${emojiName}.png`, name: emojiName });
        };

        // Creates an object to store the emojis in memory
        client.customEmojis = {};

        // Stores in memory each of the application emojis (including the ones just uploaded)
        client.application.emojis.cache.forEach(emoji => client.customEmojis[emoji.name] = emoji);

        // Notifies the correct load of custom client emojis on the client
        logger.debug('Custom emojis loading completed');

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

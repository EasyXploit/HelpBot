// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { clearConsole, confirm } from './shared/utils.js';

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (elegibleGuilds, beforeError) => {

    // Stores the translations of the bot (when the menu is shown, so a change of language is applied without restarting)
    const locale = client.locale.lib.menus[menuName];

    try {
    
        // Load the Id of the base guild
        const baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

        // Stores the Id of the base guild
        let newBaseGuildId = null;

        // Function to ask for the new base guild
        async function promptBaseGuildSelection() {

            // Cleans the console and shows the logo
            await clearConsole();
    
            // If an error ocurred on the previous run
            if (beforeError) {

                // Shows the error message
                console.log(`❌ ${locale.errorMessage}.\n`);
                if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

                // Resets the beforeError variable
                beforeError = false;
            };

            // Shows the help to choose a new base guild
            console.log(`🧹 ${locale.promptBaseGuildSelectionHeader1}.`);
            console.log(`👋 ${locale.promptBaseGuildSelectionHeader2}.\n`);

            // Asks for the base guild
            const newBaseGuild = await select({
                message: `${locale.selectANewBaseGuild}:`,
                choices: elegibleGuilds.map(guild => ({ name: `${guild.name} (${guild.id})${guild.id === baseGuildId ? ` - ${locale.alreadyConfiguredGuild}` : ''}`, value: guild }))
            });

            // If the selected base guild is different from the currently configured
            if (baseGuildId && newBaseGuild.id !== baseGuildId) {

                // Asks the user if is sure to change the base guild, and returns to the selector if not
                if (!await confirm(locale.isSureToReplaceBaseGuild)) return promptBaseGuildSelection();
            };

            // Stores the new base guild Id
            newBaseGuildId = newBaseGuild.id;

            // Cleans the console and shows the logo
            await clearConsole();
        };

        // Runs the base guild selector
        await promptBaseGuildSelection();

        // For each guild in cache
        for (let guild of elegibleGuilds.values()) {

            // If the guild is the new base guild, omits
            if (guild.id === newBaseGuildId) continue;

            // Shows through the console the guild to leave
            logger.debug(`${await client.functions.utils.parseLocale(locale.leavingGuild, { guild: `"${guild.name}" (${guild.id})` })} ...`);

            // Leaves the guild
            await guild.leave();

            // Deletes the guild from the cachedGuilds variable
            elegibleGuilds.delete(guild.id);
        };

        // Returns the new eligible guilds object
        return elegibleGuilds;

    } catch (error) {

        // Logs an error message
        logger.error(`An error occurred while loading the menu: ${error.stack}`);

        // Runs this menu again, passing the error, and returns its result
        return await client.functions.menus[menuName](elegibleGuilds, error);
    };
};

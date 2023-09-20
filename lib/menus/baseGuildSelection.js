// Imports the necessary libraries
import inquirer from 'inquirer';
import { splashLogo } from 'helpbot/loaders';

// Stores the translations of the bot
const locale = client.locale.lib.menus.baseGuildSelection;

// Exports a default function
export default async (elegibleGuilds) => {

    // Load the Id of the base guild
    const baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

    // Stores the Id of the base guild
    let newBaseGuildId = null;

    // Function to ask for the new base guild
    async function promptBaseGuildSelection() {

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);

        // Shows the help to choose a new base guild
        console.log(`🧹 ${locale.promptBaseGuildSelectionHeader1}.`);
        console.log(`👋 ${locale.promptBaseGuildSelectionHeader2}.\n`);

        // Generates the question of the base guild selector
        const questions = [
            {
                type: 'list',
                name: 'baseGuildId',
                message: `${locale.selectANewBaseGuild}:`,
                choices: elegibleGuilds.map(guild => ({ name: `${guild.name} (${guild.id})${guild.id === baseGuildId ? ` - ${locale.alreadyConfiguredGuild}` : ''}`, value: guild })),
            }
        ];

        // Asks for the base guild
        const { baseGuildId: newBaseGuild } = await inquirer.prompt(questions);

        // If the selected base guild is different from the currently configured
        if (baseGuildId && newBaseGuild.id !== baseGuildId) {

            // Asks the user if is sure to change the base guild
            const confirmation = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'isSure',
                    message: `${locale.isSureToReplaceBaseGuild} (${locale.affirmativeAnswer}/${locale.negativeAnswer}):`
                }
            ]);

            // Returns to the selector if the user is not sure
            if (locale.affirmativeAnswer !== confirmation.isSure.toLowerCase()) return promptBaseGuildSelection();
        };

        // Stores the new base guild Id
        newBaseGuildId = newBaseGuild.id;

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
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
    return elegibleGuilds
};

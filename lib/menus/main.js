// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { clearConsole } from './shared/utils.js';

// Loads the repository configuration
const packageConfig = require('./package.json');

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores whether the bot runs inside a Docker container, where updates are delivered through the image
const isRunningInDocker = process.env.RUNNING_IN_DOCKER === 'true';

// Exports a default function
export default async (beforeError) => {

    // Stores the translations of the bot (when the menu is shown, so a change of language is applied without restarting)
    const locale = client.locale.lib.menus[menuName];

    try {

        // Cleans the console and shows the logo
        await clearConsole();
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

        // Shows a text explaining the menu and providing a link to the documentation
        console.log(`👋  ${await client.functions.utils.parseLocale(locale.headerMessage, { botName: packageConfig.normalizedName, })}.\n`);
        console.log(`📖 ${await client.functions.utils.parseLocale(locale.subtitleMessage, { helpURL: client.functions.utils.docsURL() })}.\n`);
    
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
                {
                    name: `⚙️  ${locale.choices.configure}`,
                    value: 'configure'
                },
                // Only offers the built-in updater when the bot does not run inside Docker
                ...(isRunningInDocker ? [] : [{
                    name: `🔄 ${locale.choices.update}`,
                    value: 'update'
                }]),
                {
                    name: `📄 ${locale.choices.logs}`,
                    value: 'logs'
                },
                {
                    name: `❓ ${locale.choices.information}`,
                    value: 'information'
                },
                {
                    name: `⚖️  ${locale.choices.license}`,
                    value: 'license'
                },
                // Offers to restart the bot inside Docker (where the container starts it again when it stops), or to shut it down otherwise
                {
                    name: isRunningInDocker ? `🔄 ${locale.choices.restart}` : `🛑 ${locale.choices.shutdown}`,
                    value: 'shutdown'
                }
            ],
        });
    
        // When the user selects an option
        global.currentPrompt.then(async (result) => {
    
            // Switches the result
            switch (result) {
    
                // If the user wants to configure the bot
                case 'configure':
    
                    // Shows the configuration menu
                    await client.functions.menus.configure();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to update the bot
                case 'update':
    
                    // Shows the update menu
                    await client.functions.menus.update();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to view the logs of the bot
                case 'logs':
    
                    // Shows the logs menu
                    await client.functions.menus.logs();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to view the information
                case 'information':
    
                    // Shows the information menu
                    await client.functions.menus.information();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to read the license page
                case 'license':
    
                    // Shows the license menu
                    await client.functions.menus.license();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to shutdown (or restart, inside Docker) the bot
                case 'shutdown':

                    // Logs a message indicating that the user has requested to shutdown or restart the bot
                    logger.debug(`The user has requested to ${isRunningInDocker ? 'restart' : 'shutdown'} the bot.`);

                    // Cleans the console and shows the logo
                    await clearConsole();
    
                    // Shows a goodbye message
                    console.log(`${isRunningInDocker ? locale.actions.restart : locale.actions.shutdown} 👋`);
    
                    // Shuts down the bot gracefully (inside Docker, the container restarts it)
                    await client.functions.utils.shutdown();
            };

        // When an error occurs
        }).catch(async (error) => {
        
            // Runs this menu again, passing the error
            await client.functions.menus[menuName](error);
        });

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[menuName](error);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

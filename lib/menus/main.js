// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Loads the repository configuration
const packageConfig = require('./package.json');

// Stores the URL of the bot's documentation
const botHelpURL = 'https://github.com/EasyXploit/HelpBot/wiki';

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[menuName];

// Stores whether the bot runs inside a Docker container, where updates are delivered through the image
const isRunningInDocker = process.env.RUNNING_IN_DOCKER === 'true';

// Exports a default function
export default async (beforeError) => {

    try {

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

        // Shows a text explaining the menu and providing a link to the documentation
        console.log(`👋  ${await client.functions.utils.parseLocale(locale.headerMessage, { botName: packageConfig.normalizedName, })}.\n`);
        console.log(`📖 ${await client.functions.utils.parseLocale(locale.subtitleMessage, { helpURL: botHelpURL })}.\n`);
    
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
                {
                    name: `🛑 ${locale.choices.shutdown}`,
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
    
                // If the user wants to shutdown the bot
                case 'shutdown':

                    // Logs a message indicating that the user has requested to shutdown the bot
                    logger.debug('The user has requested to shutdown the bot.');

                    // Cleans the console and shows the logo
                    process.stdout.write('\u001b[2J\u001b[0;0H');
                    await splashLogo(client.locale.lib.loaders.splashLogo);
    
                    // Shows a goodbye message
                    console.log(`${locale.actions.shutdown} 👋`);
    
                    // Exits the process
                    process.exit(0);
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

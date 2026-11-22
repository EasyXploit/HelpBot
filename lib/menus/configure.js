// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { clearConsole } from './shared/utils.js';

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[menuName];

// Exports a default function
export default async (beforeError) => {

    try {

        // Cleans the console and shows the logo
        await clearConsole();
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

        // Shows a text explaining the menu
        console.log(`🛠️  ${locale.headerMessage}.\n`);
        
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
                {
                    name: `🔧 ${locale.choices.mainConfiguration}`,
                    value: 'mainConfiguration'
                },
                {
                    name: `⚖️  ${locale.choices.moderation}`,
                    value: 'moderation'
                },
                {
                    name: `💬 ${locale.choices.engagement}`,
                    value: 'engagement'
                },
                {
                    name: `👋 ${locale.choices.greetings}`,
                    value: 'greetings'
                },
                {
                    name: `📊 ${locale.choices.polls}`,
                    value: 'polls'
                },
                {
                    name: `🛠️  ${locale.choices.utilities}`,
                    value: 'utilities'
                },
                {
                    name: `🕒 ${locale.choices.scheduledMessages}`,
                    value: 'scheduledMessages'
                },
                {
                    name: `↩️  ${locale.choices.return}`,
                    value: 'return'
                }
            ],
        });

        // When the user selects an option
        global.currentPrompt.then(async (result) => {
    
            // When the user selects an option
            switch (result) {
    
                // If the user wants to go back to the main menu
                case 'return':
                    
                    // Shows the main menu
                    await client.functions.menus.main();
    
                    // Breaks the switch
                    break;

                // If the user wants to configure a module
                default:

                    // Imports the script
                    const script = await import(`./configure/${result}.js`);

                    // Runs the script
                    await script.default();

                    // Breaks the switch
                    break;
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

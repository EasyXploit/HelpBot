// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[parentMenuName].submenus[menuName];

// Exports a default function
export default async (beforeError) => {

    try {

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);
    
        // Shows a default text
        console.log('🚧 This section is currently under development.\n');
    
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
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
                    await client.functions.menus.configure();
    
                    // Breaks the switch
                    break;
            };

        // When an error occurs
        }).catch(async (error) => {
        
            // Runs this menu again, passing the error
            await client.functions.menus[parentMenuName](error, menuName);

            // Logs an error message if one occurred
            logger.error(`An error occurred while loading the menu: ${error.stack}`);
        });

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[parentMenuName](error, menuName);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

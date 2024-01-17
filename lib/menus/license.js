// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import fs from 'fs';

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[menuName];

// Exports a default function
export default async (beforeError) => {

    try {

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

        // Reads the license file
        const licenseContent = fs.readFileSync('LICENSE.md', 'utf8');

        // Shows the license file content in the console
        console.log(licenseContent);
    
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
                    await client.functions.menus.main();
    
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

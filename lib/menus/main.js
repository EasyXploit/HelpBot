// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

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
    
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
                {
                    name: `⚙️  ${locale.choices.configure}`,
                    value: 'configure'
                },
                {
                    name: `🔄 ${locale.choices.update}`,
                    value: 'update'
                },
                {
                    name: `📄 ${locale.choices.logs}`,
                    value: 'logs'
                },
                {
                    name: `📊 ${locale.choices.statistics}`,
                    value: 'statistics'
                },
                {
                    name: `❓ ${locale.choices.about}`,
                    value: 'about'
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
    
                // If the user wants to view the statistics
                case 'statistics':
    
                    // Shows the statistics menu
                    await client.functions.menus.statistics();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to read the about page
                case 'about':
    
                    // Shows the about menu
                    await client.functions.menus.about();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to shutdown the bot
                case 'shutdown':
    
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
    };
};
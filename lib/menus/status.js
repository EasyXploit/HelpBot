// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Stores the translations of the bot
const locale = client.locale.lib.menus.status;

// Exports a default function
export default async () => {

    // Cleans the console and shows the logo
    process.stdout.write('\u001b[2J\u001b[0;0H');
    await splashLogo(client.locale.lib.loaders.splashLogo);

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
    });
};

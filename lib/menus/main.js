// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Stores the translations of the bot
const locale = client.locale.lib.menus.main;

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
                name: `⚙️  ${locale.choices.configure}`,
                value: 'configure'
            },
            {
                name: `🟢 ${locale.choices.status}`,
                value: 'status'
            },
            {
                name: `📊 ${locale.choices.statistics}`,
                value: 'statistics'
            },
            {
                name: `❓ ${locale.choices.help}`,
                value: 'help'
            },
            {
                name: `📚 ${locale.choices.about}`,
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

            // If the user wants to view the status of the bot
            case 'status':

                // Shows the status menu
                await client.functions.menus.status();

                // Breaks the switch
                break;

            // If the user wants to view the statistics
            case 'statistics':

                // Shows the statistics menu
                await client.functions.menus.statistics();

                // Breaks the switch
                break;

            // If the user wants to get help
            case 'help':

                // Shows the help menu
                await client.functions.menus.help();

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
    });
};

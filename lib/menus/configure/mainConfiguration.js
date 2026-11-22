// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getLocale, clearConsole } from './mainConfiguration/utils.js';
import selectLanguageMenu from './mainConfiguration/language.js';
import commandNamesLanguageMenu from './mainConfiguration/commandNamesLanguage.js';
import setPingThresholdMenu from './mainConfiguration/pingThreshold.js';
import botManagersMenu from './mainConfiguration/botManagers.js';
import recordsMenu from './mainConfiguration/records.js';
import presenceMenu from './mainConfiguration/presence.js';
import ignoredCommandsMenu from './mainConfiguration/ignoredCommands.js';
import colorPaletteMenu from './mainConfiguration/colorPalette.js';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (beforeError) => {

    try {

        // Function to draw the menu
        async function drawMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows an error message if one occurred
            if (beforeError) {

                // Prints the error message
                console.log(`❌ ${currentLocale.errorMessage}.\n`);

                // Logs the error if not in production
                if (process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

                // Clears the error so it doesn't persist
                beforeError = null;
            };

            // Shows a text explaining the module
            console.log(`🔧 ${currentLocale.headerMessage}.\n`);

            // Shows the select menu
            global.currentPrompt = select({
                message: `${currentLocale.promptMessage}:`,
                choices: [
                    {
                        name: `🌐 ${currentLocale.choices.language}`,
                        value: 'language'
                    },
                    {
                        name: `🏷️  ${currentLocale.choices.commandNamesLanguage}`,
                        value: 'commandNamesLanguage'
                    },
                    {
                        name: `⚡ ${currentLocale.choices.pingMsTreshold}`,
                        value: 'pingMsTreshold'
                    },
                    {
                        name: `🛡️  ${currentLocale.choices.botManagers}`,
                        value: 'botManagers'
                    },
                    {
                        name: `🗄️  ${currentLocale.choices.records}`,
                        value: 'records'
                    },
                    {
                        name: `🎭 ${currentLocale.choices.presence}`,
                        value: 'presence'
                    },
                    {
                        name: `🚫 ${currentLocale.choices.ignoredCommands}`,
                        value: 'ignoredCommands'
                    },
                    {
                        name: `🎨 ${currentLocale.choices.colorPalette}`,
                        value: 'colorPalette'
                    },
                    {
                        name: `↩️  ${currentLocale.choices.return}`,
                        value: 'return'
                    }
                ],
            });

            // When the user selects an option
            global.currentPrompt.then(async (result) => {

                // Evaluates the selected option
                switch (result) {

                    // If the user wants to select a language
                    case 'language':

                        // Shows the language selection menu
                        await selectLanguageMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to select the language of the command names
                    case 'commandNamesLanguage':

                        // Shows the language of the command names menu
                        await commandNamesLanguageMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure ping threshold
                    case 'pingMsTreshold':

                        // Shows the ping threshold configuration menu
                        await setPingThresholdMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure bot managers
                    case 'botManagers':

                        // Shows the bot managers menu
                        await botManagersMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure records/logs
                    case 'records':

                        // Shows the logging records menu
                        await recordsMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure bot presence
                    case 'presence':

                        // Shows the presence configuration menu
                        await presenceMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure ignored commands
                    case 'ignoredCommands':

                        // Shows the ignored commands configuration menu
                        await ignoredCommandsMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure color palette
                    case 'colorPalette':

                        // Shows the color palette configuration menu
                        await colorPaletteMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to return to the main menu
                    case 'return':

                        // Shows the main configure menu
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
        };

        // Draws the menu for the first time
        await drawMenu();

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[parentMenuName](error, menuName);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

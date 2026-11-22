// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { loadCommands } from 'helpbot/loaders';
import { getLocale, clearConsole, wait, drawMenu, getLanguageChoices } from './utils.js';

// Submenu to select the language of the command names
async function commandNamesLanguageMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations, and the current language of the command names
    const currentLocale = getLocale();
    const forceNameLocale = await client.functions.db.getConfig('commands.forceNameLocale') || '';

    // Shows the explanation header
    console.log(`🏷️  ${currentLocale.prompts.commandNamesLanguageHeader}.\n`);

    // Shows the language selection list, with the option to use the bot language, and the current one selected
    const selectedLanguage = await select({
        message: `${currentLocale.prompts.selectCommandNamesLanguage}:`,
        choices: [{ name: `🤖 ${currentLocale.prompts.sameAsBotLanguage}`, value: '' }, ...getLanguageChoices(), { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }],
        default: forceNameLocale
    });

    // If the user wants to return, or the language did not change, returns to the main configuration menu
    if (selectedLanguage === 'return' || selectedLanguage === forceNameLocale) return await drawMenu();

    // Stores the new language of the command names
    await client.functions.db.setConfig('commands.forceNameLocale', selectedLanguage);

    // Reloads the commands, so they are registered in Discord with their new names
    console.log(`\n⏳ ${currentLocale.prompts.updatingCommands}...`);
    await loadCommands();

    // Shows a success message
    console.log(`\n🟢 ${currentLocale.prompts.commandNamesLanguageSuccess}`);

    // Waits 3 seconds
    await wait(3);

    // Returns to the main configuration menu
    await drawMenu();
};

// Exports the submenu
export default commandNamesLanguageMenu;

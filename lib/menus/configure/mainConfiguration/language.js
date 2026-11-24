// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { loadLocales, loadCommands } from 'helpbot/loaders';
import fs from 'fs';
import { getLocale, clearConsole, wait, drawMenu, getLanguageChoices } from './utils.js';

// Submenu to select the bot language
async function selectLanguageMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Shows the select language explanation header
    console.log(`🌐 ${currentLocale.prompts.selectLanguageHeader}.\n`);

    // If the language is set by the "LOCALE" environment variable, which takes precedence over the local configuration
    if (process.env.LOCALE && process.env.LOCALE.length > 0) {

        // Shows a message indicating that it can only be changed there
        console.log(`🔒 ${await client.functions.utils.parseLocale(currentLocale.prompts.languageSetByEnvironment, { locale: process.env.LOCALE })}.`);

        // Waits 4 seconds
        await wait(4);

        // Returns to the main configuration menu
        return await drawMenu();
    };

    // Shows the language selection list (from the files of the "locales" folder), with the current language selected
    const selectedLanguage = await select({
        message: `${currentLocale.prompts.selectLanguage}:`,
        choices: getLanguageChoices(),
        default: client.localConfig.locale
    });

    // Gets local configuration data
    const localConfig = client.localConfig;

    // Updates language in configuration
    localConfig.locale = selectedLanguage;

    // Writes updated configuration file
    await fs.promises.writeFile(client.functions.utils.configFile(), JSON.stringify(localConfig, null, 4));

    // Reloads locale translations in memory
    client.locale = await loadLocales(selectedLanguage);

    // Reloads the commands, so their names (unless they are forced to another language) and descriptions are shown in the new language
    console.log(`\n⏳ ${getLocale().prompts.updatingCommands}...`);
    await loadCommands();

    // Shows language success message
    console.log(`\n🟢 ${getLocale().prompts.languageSuccess}.`);

    // Waits 3 seconds
    await wait(3);

    // Returns to the main configuration menu
    await drawMenu();
};

// Exports the submenu
export default selectLanguageMenu;

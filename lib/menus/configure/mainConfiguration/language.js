// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { loadLocales } from 'helpbot/loaders';
import fs from 'fs';
import { getLocale, clearConsole, drawMenu } from './utils.js';

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
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Returns to the main configuration menu
        return await drawMenu();
    };

    // Shows the language selection list
    const selectedLanguage = await select({
        message: `${currentLocale.prompts.selectLanguage}:`,
        choices: [
            { name: '🇺🇸 English (en-US)', value: 'en-US' },
            { name: '🇪🇸 Español (es-ES)', value: 'es-ES' },
            { name: '🇮🇹 Italiano (it)', value: 'it' },
            { name: '🇷🇴 Română (ro)', value: 'ro' },
            { name: '🇨🇳 简体中文 (zh-CN)', value: 'zh-CN' }
        ]
    });

    // Gets local configuration data
    const localConfig = client.localConfig;

    // Updates language in configuration
    localConfig.locale = selectedLanguage;

    // Writes updated configuration file
    await fs.promises.writeFile('./config.json', JSON.stringify(localConfig, null, 4));

    // Reloads locale translations in memory
    client.locale = await loadLocales(selectedLanguage);

    // Shows language success message
    console.log(`\n🟢 ${getLocale().prompts.languageSuccess}.`);

    // Waits 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Returns to the main configuration menu
    await drawMenu();
};

// Exports the submenu
export default selectLanguageMenu;

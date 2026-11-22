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

    // Stores the available languages, from the files of the "locales" folder
    const languages = fs.readdirSync('./locales/').filter(file => file.endsWith('.json')).map(file => {

        // Stores the code of the language
        const code = file.replace('.json', '');

        try {

            // Completes the code with its most likely script and country (for example, "it" becomes "it-Latn-IT")
            const language = new Intl.Locale(code).maximize();

            // Stores the name of the language, written in that language (with the script for the languages that have several, like Chinese)
            const languageName = new Intl.DisplayNames([code], { type: 'language' }).of(['Hans', 'Hant'].includes(language.script) ? `${language.language}-${language.script}` : language.language);

            // Stores the flag of the country, made with the regional indicator symbols of its code (or a globe if it has no country, like "es-419")
            const flag = /^[A-Z]{2}$/.test(language.region) ? [...language.region].map(letter => String.fromCodePoint(0x1F1E6 + letter.charCodeAt(0) - 65)).join('') : '🌐';

            // Returns the choice of the language, with the first letter of the name in capital letters
            return { name: `${flag} ${languageName.charAt(0).toLocaleUpperCase(code)}${languageName.slice(1)} (${code})`, value: code };

        } catch (error) {

            // If the code is not a valid language code, shows only the code
            return { name: `🌐 ${code}`, value: code };
        };
    });

    // Shows the language selection list, with the current language selected
    const selectedLanguage = await select({
        message: `${currentLocale.prompts.selectLanguage}:`,
        choices: languages,
        default: client.localConfig.locale
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

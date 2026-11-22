// Imports the necessary libraries
import { splashLogo } from 'helpbot/loaders';
import fs from 'fs';

// Function to get the translations of the general configuration menu
export function getLocale() {
    return client.locale.lib.menus.configure.submenus.mainConfiguration;
};

// Function to clear the console
export async function clearConsole() {
    // Cleans the console and shows the logo
    process.stdout.write('\u001b[2J\u001b[0;0H');
    await splashLogo(client.locale.lib.loaders.splashLogo);
};

// Function to draw the general configuration menu again
export async function drawMenu() {

    // Imports the general configuration menu (when needed, as it also imports this file)
    const mainConfiguration = await import('../mainConfiguration.js');

    // Shows the menu
    await mainConfiguration.default();
};

// Function to get the choices of the available languages, from the files of the "locales" folder
export function getLanguageChoices() {

    // Returns the available languages, from the files of the "locales" folder
    return fs.readdirSync('./locales/').filter(file => file.endsWith('.json')).map(file => {

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
};

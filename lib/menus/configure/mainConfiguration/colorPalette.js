// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';

// Submenu to configure color palette
async function colorPaletteMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Shows color palette explanation header
    console.log(`🎨 ${currentLocale.prompts.colorPaletteHeader}.\n`);

    // List of color keys to configure
    const colorKeys = ['primary', 'error', 'secondaryError', 'correct', 'secondaryCorrect', 'warning', 'information', 'logging', 'polls'];

    // Stores select options for color palette keys
    const choices = [];

    // Loops through each color key
    for (const key of colorKeys) {

        // Gets current color hex value
        const val = await client.functions.db.getConfig(`colors.${key}`) || 'FFFFFF';

        // Pushes color choice to choice list
        choices.push({ name: `${key} [#${val}]`, value: key });
    };

    // Pushes return choice option to list
    choices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

    // Shows select menu to choose color key
    const selectedRole = await select({
        message: `${currentLocale.prompts.selectColor}:`,
        choices: choices
    });

    // If user wants to return
    if (selectedRole === 'return') {

        // Returns to main configuration menu
        await drawMenu();

        // Returns to break execution
        return;
    };

    // Predefined list of preset colors
    const presetColors = [
        { name: `🔴 ${currentLocale.prompts.presetColors.red} (#FF0000)`, value: 'FF0000' },
        { name: `🟠 ${currentLocale.prompts.presetColors.orange} (#FFA500)`, value: 'FFA500' },
        { name: `🟡 ${currentLocale.prompts.presetColors.yellow} (#FFFF00)`, value: 'FFFF00' },
        { name: `🟢 ${currentLocale.prompts.presetColors.green} (#008000)`, value: '008000' },
        { name: `🔵 ${currentLocale.prompts.presetColors.blue} (#0000FF)`, value: '0000FF' },
        { name: `🟣 ${currentLocale.prompts.presetColors.purple} (#800080)`, value: '800080' },
        { name: `🌸 ${currentLocale.prompts.presetColors.pink} (#FFC0CB)`, value: 'FFC0CB' },
        { name: `⚪ ${currentLocale.prompts.presetColors.white} (#FFFFFF)`, value: 'FFFFFF' },
        { name: `⚫ ${currentLocale.prompts.presetColors.black} (#000000)`, value: '000000' },
        { name: currentLocale.prompts.customHexOption, value: 'custom' },
        { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
    ];

    // Shows select menu to choose color value
    const selectedVal = await select({
        message: `${currentLocale.prompts.selectPredefinedColor}:`,
        choices: presetColors
    });

    // If user wants to return
    if (selectedVal === 'return') {

        // Runs color palette menu again
        await colorPaletteMenu();

        // Returns to break execution
        return;
    };

    // If user wants to configure custom hex color
    if (selectedVal === 'custom') {

        // Prompts user to enter custom hex
        const hexInput = await input({
            message: `${currentLocale.prompts.enterHex}:`,
            validate: v => {
                const hexRegex = /^[0-9A-Fa-f]{6}$/;
                if (!hexRegex.test(v)) return `${currentLocale.prompts.invalidHex}.`;
                return true;
            }
        });

        // Updates configured color in database
        await client.functions.db.setConfig(`colors.${selectedRole}`, hexInput.toUpperCase());

    // If user chose a predefined color
    } else {

        // Updates configured color in database
        await client.functions.db.setConfig(`colors.${selectedRole}`, selectedVal);
    };

    // Prints success message
    console.log(`\n🟢 ${currentLocale.prompts.colorSuccess}`);

    // Waits 2 seconds
    await wait(2);

    // Runs color palette menu again
    await colorPaletteMenu();
};

// Exports the submenu
export default colorPaletteMenu;

// Imports the necessary libraries
import { input } from '@inquirer/prompts';
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';

// Submenu to set the ping threshold
async function setPingThresholdMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Shows the ping threshold explanation header
    console.log(`⚡ ${currentLocale.prompts.pingThresholdHeader}.\n`);

    // Gets current threshold from database
    const currentThreshold = await client.functions.db.getConfig('system.pingMsTreshold');

    // Prints current ping threshold
    console.log(`Current ping threshold: ${currentThreshold} ms\n`);

    // Prompts user to enter new threshold
    const thresholdInput = await input({
        message: `${currentLocale.prompts.enterPingThreshold}:`,
        validate: value => {
            const val = value.trim();
            if (val === '') return true;
            const parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed <= 0) return 'Please enter a positive integer.';
            return true;
        }
    });

    // Trims whitespace from input
    const val = thresholdInput.trim();

    // If input is empty
    if (val === '') {

        // Returns to main configuration menu
        await drawMenu();

        // Returns to break execution
        return;
    };

    // Parses threshold to integer
    const parsedVal = parseInt(thresholdInput, 10);

    // Updates ping threshold in database
    await client.functions.db.setConfig('system.pingMsTreshold', parsedVal);

    // Shows threshold success message
    console.log(`\n🟢 ${getLocale().prompts.pingSuccess.replace('{{threshold}}', parsedVal)}.`);

    // Waits 2 seconds
    await wait(2);

    // Returns to main configuration menu
    await drawMenu();
};

// Exports the submenu
export default setPingThresholdMenu;

// Imports the necessary libraries
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';
import { askNumber } from '../../shared/utils.js';

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
    console.log(`${currentLocale.prompts.currentPingThreshold.replace('{{threshold}}', currentThreshold)}\n`);

    // Asks for the new threshold (a whole number greater than 0, or the current one if nothing is written)
    const newThreshold = await askNumber(currentLocale.prompts.enterNewPingThreshold, currentThreshold, 1);

    // If the threshold changed
    if (newThreshold !== currentThreshold) {

        // Updates ping threshold in database
        await client.functions.db.setConfig('system.pingMsTreshold', newThreshold);

        // Shows threshold success message
        console.log(`\n🟢 ${currentLocale.prompts.pingSuccess.replace('{{threshold}}', newThreshold)}.`);

        // Waits 2 seconds
        await wait(2);
    };

    // Returns to main configuration menu
    await drawMenu();
};

// Exports the submenu
export default setPingThresholdMenu;

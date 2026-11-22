// Imports the necessary libraries
import { splashLogo } from 'helpbot/loaders';

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

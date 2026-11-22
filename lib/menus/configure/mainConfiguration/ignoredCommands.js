// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { loadCommands } from 'helpbot/loaders';
import fs from 'fs';
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';

// Submenu to configure ignored commands
async function ignoredCommandsMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Shows ignored commands explanation header
    console.log(`🚫 ${currentLocale.prompts.ignoredCommandsHeader}.\n`);

    // Shows select menu to choose command type
    const cmdType = await select({
        message: `${currentLocale.prompts.ignoredCommandsAction}:`,
        choices: [
            { name: '🗨️  Chat Commands', value: 'chatCommands' },
            { name: '✉️  Message Commands', value: 'messageCommands' },
            { name: '👤 User Commands', value: 'userCommands' },
            { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
        ]
    });

    // If user wants to return
    if (cmdType === 'return') {

        // Returns to main configuration menu
        await drawMenu();

        // Returns to break execution
        return;
    };

    // Gets list of currently ignored commands
    const ignored = await client.functions.db.getConfig(`commands.ignored.${cmdType}`) || [];

    // Reads files from commands directory
    const localCommands = fs.readdirSync(`./handlers/commands/${cmdType}/`);

    // Maps files to choose choices list
    const choices = localCommands.map(cmdFile => {

        // Gets locale definitions for the command file
        const loc = client.locale.handlers.commands[cmdType][cmdFile];

        // Sets the name to display
        const name = loc ? loc.appData.name : cmdFile;

        // Checks if command is ignored
        const isIgnored = ignored.includes(name);

        // Returns choice option representation
        return {
            name: `${name} [${isIgnored ? '🔴 Ignored' : '🟢 Active'}]`,
            value: name
        };
    });

    // Pushes return choice option to list
    choices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

    // Shows select menu to toggle command ignore status
    const selectedCmd = await select({
        message: `${currentLocale.prompts.toggleIgnoredPrompt}:`,
        choices: choices
    });

    // If a command is selected
    if (selectedCmd !== 'return') {

        // Stores the updated ignored list
        let updated;

        // If command was already ignored
        if (ignored.includes(selectedCmd)) {

            // Removes command from ignored list
            updated = ignored.filter(x => x !== selectedCmd);

        // If command was not ignored
        } else {

            // Adds command to ignored list
            updated = [...ignored, selectedCmd];
        };

        // Updates ignored commands in database
        await client.functions.db.setConfig(`commands.ignored.${cmdType}`, updated);

        // Reloads commands in memory
        await loadCommands();

        // Prints success message
        console.log(`\n🟢 ${currentLocale.prompts.ignoredSuccess}`);

        // Waits 2 seconds
        await wait(2);
    };

    // Runs ignored commands menu again
    await ignoredCommandsMenu();
};

// Exports the submenu
export default ignoredCommandsMenu;

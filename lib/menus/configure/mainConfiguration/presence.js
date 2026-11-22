// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';

// Submenu to configure bot presence status
async function presenceMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Shows presence explanation header
    console.log(`🎭 ${currentLocale.prompts.presenceHeader}.\n`);

    // Shows presence actions select menu
    const presenceAction = await select({
        message: `${currentLocale.prompts.presenceAction}:`,
        choices: [
            { name: currentLocale.prompts.changePresenceText, value: 'text' },
            { name: currentLocale.prompts.toggleMembersCount, value: 'membersCount' },
            { name: currentLocale.prompts.changePresenceStatus, value: 'status' },
            { name: currentLocale.prompts.changePresenceType, value: 'type' },
            { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
        ]
    });

    // If user wants to return
    if (presenceAction === 'return') {

        // Returns to main configuration menu
        await drawMenu();

        // Returns to break execution
        return;
    };

    // If user wants to change presence text
    if (presenceAction === 'text') {

        // Prompts user for presence text
        const text = await input({
            message: `${currentLocale.prompts.enterPresenceText}:`
        });

        // Updates presence text in database
        await client.functions.db.setConfig('presence.showText', text);

        // Triggers bot presence updates
        await client.functions.managers.updatePresence();

        // Prints success message
        console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

        // Waits 2 seconds
        await wait(2);

        // Runs presence configuration menu again
        await presenceMenu();

    // If user wants to toggle member count presence
    } else if (presenceAction === 'membersCount') {

        // Gets current member count presence status
        const current = await client.functions.db.getConfig('presence.membersCount');

        // Toggles member count presence in database
        await client.functions.db.setConfig('presence.membersCount', !current);

        // Triggers bot presence updates
        await client.functions.managers.updatePresence();

        // Prints success message
        console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

        // Waits 2 seconds
        await wait(2);

        // Runs presence configuration menu again
        await presenceMenu();

    // If user wants to change presence online status
    } else if (presenceAction === 'status') {

        // Shows status selection menu
        const newStatus = await select({
            message: `${currentLocale.prompts.changePresenceStatus}:`,
            choices: [
                { name: '🟢 Online', value: 'online' },
                { name: '🌙 Idle', value: 'idle' },
                { name: '🔴 Do Not Disturb', value: 'dnd' },
                { name: '⚫ Offline', value: 'offline' }
            ]
        });

        // Updates presence status in database
        await client.functions.db.setConfig('presence.status', newStatus);

        // Triggers bot presence updates
        await client.functions.managers.updatePresence();

        // Prints success message
        console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

        // Waits 2 seconds
        await wait(2);

        // Runs presence configuration menu again
        await presenceMenu();

    // If user wants to change presence activity type
    } else if (presenceAction === 'type') {

        // Shows activity type selection menu
        const newType = await select({
            message: `${currentLocale.prompts.changePresenceType}:`,
            choices: [
                { name: 'Playing', value: 'PLAYING' },
                { name: 'Streaming', value: 'STREAMING' },
                { name: 'Listening', value: 'LISTENING' },
                { name: 'Watching', value: 'WATCHING' },
                { name: 'Custom', value: 'CUSTOM' },
                { name: 'Competing', value: 'COMPETING' }
            ]
        });

        // Updates presence activity type in database
        await client.functions.db.setConfig('presence.type', newType);

        // Triggers bot presence updates
        await client.functions.managers.updatePresence();

        // Prints success message
        console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

        // Waits 2 seconds
        await wait(2);

        // Runs presence configuration menu again
        await presenceMenu();
    };
};

// Exports the submenu
export default presenceMenu;

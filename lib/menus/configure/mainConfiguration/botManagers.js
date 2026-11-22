// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';
import { getRoleText, getMemberText, selectRole, selectMember } from '../../shared/utils.js';

// Function to get the text that shows a manager (a role or a member, followed by its ID if "showId" is true, or only its ID if it could not be found)
async function getManagerText(managerId, showId = false) {

    // If it is a role, returns its name
    if (client.baseGuild.roles.cache.has(managerId)) return `👥 ${getRoleText(managerId)}${showId ? ` - ${managerId}` : ''}`;

    // If it is a member, returns its name
    if (await client.functions.utils.fetch('member', managerId)) return `👤 ${await getMemberText(managerId)}${showId ? ` - ${managerId}` : ''}`;

    // If it could not be found, returns its ID
    return `❓ ID: ${managerId}`;
};

// Submenu to manage bot managers
async function botManagersMenu() {

    // Clears the console
    await clearConsole();

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Shows the bot managers explanation header
    console.log(`🛡️  ${currentLocale.prompts.botManagersHeader}.\n`);

    // Gets current managers list from database
    const currentManagers = await client.functions.db.getConfig('system.botManagers') || [];

    // Shows the current managers (or that there are none)
    console.log(`🛡️  ${currentLocale.prompts.currentBotManagersTitle}:`);
    if (currentManagers.length === 0) console.log(`  ${currentLocale.prompts.noManagersConfigured}.`);
    for (const managerId of currentManagers) console.log(`  • ${await getManagerText(managerId)}`);
    console.log();

    // Shows bot manager options select prompt (the option to remove only if there are managers)
    const action = await select({
        message: `${currentLocale.prompts.managersAction}:`,
        choices: [
            { name: `➕ ${currentLocale.prompts.addManager}`, value: 'add' },
            ...(currentManagers.length > 0 ? [{ name: `➖ ${currentLocale.prompts.removeManager}`, value: 'remove' }] : []),
            { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
        ]
    });

    // If user wants to return, returns to the main configuration menu
    if (action === 'return') return await drawMenu();

    // If user wants to add a manager
    if (action === 'add') {

        // Asks for the type of manager
        const managerType = await select({
            message: `${currentLocale.prompts.selectManagerType}:`,
            choices: [
                { name: `👤 ${currentLocale.prompts.memberManager}`, value: 'member' },
                { name: `👥 ${currentLocale.prompts.roleManager}`, value: 'role' },
                { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
            ]
        });

        // Asks for the member or the role (unless the user wants to return)
        const managerId = managerType === 'member' ? await selectMember() : managerType === 'role' ? await selectRole() : null;

        // If a member or a role was chosen
        if (managerId) {

            // If it is already a manager, shows a warning
            if (currentManagers.includes(managerId)) {
                console.log(`\n⚠️  ${currentLocale.prompts.alreadyManager}`);

            // If it is not a manager yet
            } else {

                // Adds it to the managers list in database
                await client.functions.db.setConfig('system.botManagers', [...currentManagers, managerId]);

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.managerAdded}`);
            };

            // Waits 2 seconds
            await wait(2);
        };

    // If user wants to remove a manager
    } else if (action === 'remove') {

        // Stores the manager choice list
        const managerChoices = [];
        for (const managerId of currentManagers) managerChoices.push({ name: await getManagerText(managerId, true), value: managerId });

        // Shows select menu to choose manager to remove
        const selectedManagerId = await select({
            message: `${currentLocale.prompts.selectManagerToRemove}:`,
            choices: [...managerChoices, { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }]
        });

        // If a manager is selected for removal
        if (selectedManagerId !== 'return') {

            // Removes it from the managers list in database
            await client.functions.db.setConfig('system.botManagers', currentManagers.filter(id => id !== selectedManagerId));

            // Prints success message
            console.log(`\n🟢 ${currentLocale.prompts.managerRemoved}`);

            // Waits 2 seconds
            await wait(2);
        };
    };

    // Runs bot managers menu again
    await botManagersMenu();
};

// Exports the submenu
export default botManagersMenu;

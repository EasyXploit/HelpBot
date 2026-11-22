// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { getLocale, clearConsole, wait, drawMenu } from './utils.js';

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

    // Shows current managers title
    console.log(`🛡️  ${currentLocale.prompts.currentBotManagersTitle}:`);

    // If no managers are configured
    if (currentManagers.length === 0) {

        // Prints no managers configured message
        console.log(`   ${currentLocale.prompts.noManagersConfigured}.`);

    // If there are configured managers
    } else {

        // Loops through each manager ID
        for (const id of currentManagers) {

            // Attempts to get role from cache
            const role = client.baseGuild.roles.cache.get(id);

            // If it is a role
            if (role) {

                // Prints the role details
                console.log(`   - [Role] ${role.name} (${id})`);

                // Continues the loop
                continue;
            };

            // Attempts to get member from cache
            let member = client.baseGuild.members.cache.get(id);

            // If member not found in cache
            if (!member) {

                // Try to fetch member from guild
                try {

                    // Fetches member by ID
                    member = await client.baseGuild.members.fetch(id);

                // In case of error
                } catch (err) {
                    // ignore
                }
            };

            // If member was fetched successfully
            if (member) {

                // Prints the member details
                console.log(`   - [User] ${member.user.username}${member.nickname ? ` (${member.nickname})` : ''} (${id})`);

            // If neither role nor member could be resolved
            } else {

                // Prints unknown manager details
                console.log(`   - [Unknown] ${id}`);
            };
        };
    };

    // Prints blank line
    console.log();

    // Shows bot manager options select prompt
    const action = await select({
        message: `${currentLocale.prompts.managersAction}:`,
        choices: [
            { name: `➕ ${currentLocale.prompts.addManager}`, value: 'add' },
            { name: `➖ ${currentLocale.prompts.removeManager}`, value: 'remove' },
            { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
        ]
    });

    // If user wants to return
    if (action === 'return') {

        // Returns to main configuration menu
        await drawMenu();

        // Returns to break execution
        return;
    };

    // If user wants to add a manager
    if (action === 'add') {

        // Shows search method select prompt
        const searchMethod = await select({
            message: `${currentLocale.prompts.searchMethod}:`,
            choices: [
                { name: currentLocale.prompts.searchByName, value: 'name' },
                { name: currentLocale.prompts.searchRoleByName, value: 'role' },
                { name: currentLocale.prompts.enterId, value: 'id' }
            ]
        });

        // Stores the selected ID to add
        let selectedMemberId = null;

        // If search method is by user name
        if (searchMethod === 'name') {

            // Prompts for query string
            const query = await input({
                message: `${currentLocale.prompts.searchNamePrompt}:`
            });

            // Filters cached members by name query
            let filtered = client.baseGuild.members.cache.filter(m =>
                (m.user.username && m.user.username.toLowerCase().includes(query.toLowerCase())) ||
                (m.nickname && m.nickname.toLowerCase().includes(query.toLowerCase()))
            );

            // If not found in cache
            if (filtered.size === 0) {

                // Try to fetch members by query
                try {

                    // Fetches members from guild API
                    const fetched = await client.baseGuild.members.fetch({ query: query, limit: 25 });

                    // Updates filtered list
                    filtered = fetched;

                // In case of error
                } catch (err) {
                    // ignore
                }
            };

            // If no members were found
            if (!filtered || filtered.size === 0) {

                // Prints no members found message
                console.log(`\n❌ ${currentLocale.prompts.noMembersFound}.`);

                // Waits 2 seconds
                await wait(2);

                // Runs bot managers menu again
                await botManagersMenu();

                // Returns to break execution
                return;
            };

            // Maps members to choice options
            const memberChoices = filtered.map(m => ({
                name: `${m.user.username}${m.nickname ? ` (${m.nickname})` : ''} - ${m.id}`,
                value: m.id
            })).slice(0, 25);

            // Pushes return choice option to list
            memberChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

            // Shows select menu to choose member
            selectedMemberId = await select({
                message: `${currentLocale.prompts.selectMemberPrompt}:`,
                choices: memberChoices
            });

            // If user wants to return
            if (selectedMemberId === 'return') {

                // Runs bot managers menu again
                await botManagersMenu();

                // Returns to break execution
                return;
            };

        // If search method is by role name
        } else if (searchMethod === 'role') {

            // Prompts for role query
            const query = await input({
                message: `${currentLocale.prompts.searchRolePrompt}:`
            });

            // Filters cached roles by name query
            let roles = client.baseGuild.roles.cache.filter(r =>
                r.name.toLowerCase().includes(query.toLowerCase())
            );

            // If not found in cache
            if (roles.size === 0) {

                // Try to fetch all guild roles
                try {

                    // Fetches all roles from guild API
                    const fetchedRoles = await client.baseGuild.roles.fetch();

                    // Filters fetched roles by query
                    roles = fetchedRoles.filter(r =>
                        r.name.toLowerCase().includes(query.toLowerCase())
                    );

                // In case of error
                } catch (err) {
                    // ignore
                }
            };

            // If no roles were found
            if (!roles || roles.size === 0) {

                // Prints no roles found message
                console.log(`\n❌ ${currentLocale.prompts.noRolesFound}.`);

                // Waits 2 seconds
                await wait(2);

                // Runs bot managers menu again
                await botManagersMenu();

                // Returns to break execution
                return;
            };

            // Maps roles to choices options
            const roleChoices = roles.map(r => ({
                name: `👥 ${r.name} - ${r.id}`,
                value: r.id
            })).slice(0, 25);

            // Pushes return choice option to list
            roleChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

            // Shows select menu to choose role
            selectedMemberId = await select({
                message: `${currentLocale.prompts.selectRolePrompt}:`,
                choices: roleChoices
            });

            // If user wants to return
            if (selectedMemberId === 'return') {

                // Runs bot managers menu again
                await botManagersMenu();

                // Returns to break execution
                return;
            };

        // If search method is by ID
        } else {

            // Prompts user to enter ID
            const inputId = await input({
                message: `${currentLocale.prompts.enterIdPrompt}:`,
                validate: v => v.trim().length > 0 ? true : 'ID cannot be empty'
            });

            // Checks if role ID exists in cache
            let exists = client.baseGuild.roles.cache.has(inputId);

            // If role ID not in cache
            if (!exists) {

                // Try to fetch role from API
                try {

                    // Fetches role by ID
                    const fetchedRole = await client.baseGuild.roles.fetch(inputId);

                    // If fetched role exists, sets exists to true
                    if (fetchedRole) exists = true;

                // In case of error
                } catch (err) {
                    // ignore
                }
            };

            // If not a role, check member
            if (!exists) {

                // Fetches member by ID
                const member = await client.functions.utils.fetch('member', inputId);

                // If fetched member exists, sets exists to true
                if (member) exists = true;
            };

            // If neither role nor member exists
            if (!exists) {

                // Prints error message
                console.log(`\n❌ ${currentLocale.prompts.noUsersOrRolesFound}.`);

                // Waits 2 seconds
                await wait(2);

                // Runs bot managers menu again
                await botManagersMenu();

                // Returns to break execution
                return;
            };

            // Sets selected manager ID to input
            selectedMemberId = inputId;
        };

        // Gets current managers list
        const currentManagers = await client.functions.db.getConfig('system.botManagers') || [];

        // If already configured as manager
        if (currentManagers.includes(selectedMemberId)) {

            // Prints warning message
            console.log(`\n⚠️  ${currentLocale.prompts.alreadyManager}`);

        // If not configured as manager
        } else {

            // Pushes selected ID to managers list
            currentManagers.push(selectedMemberId);

            // Updates managers list in database
            await client.functions.db.setConfig('system.botManagers', currentManagers);

            // Prints success message
            console.log(`\n🟢 ${currentLocale.prompts.managerAdded}`);
        };

        // Waits 2 seconds
        await wait(2);

        // Runs bot managers menu again
        await botManagersMenu();

    // If user wants to remove a manager
    } else if (action === 'remove') {

        // Gets current managers list
        const currentManagers = await client.functions.db.getConfig('system.botManagers') || [];

        // If no managers are configured
        if (currentManagers.length === 0) {

            // Prints error message
            console.log(`\n❌ ${currentLocale.prompts.noManagersConfigured}.`);

            // Waits 2 seconds
            await wait(2);

            // Runs bot managers menu again
            await botManagersMenu();

            // Returns to break execution
            return;
        };

        // Stores the manager choice list
        const managerChoices = [];

        // Loops through configured managers
        for (const managerId of currentManagers) {

            // Checks if manager ID is role
            const role = client.baseGuild.roles.cache.get(managerId);

            // If manager ID is role
            if (role) {

                // Pushes role option to choices
                managerChoices.push({
                    name: `👥 [Role] ${role.name} - ${managerId}`,
                    value: managerId
                });

                // Continues loop
                continue;
            };

            // Gets member from cache
            let member = client.baseGuild.members.cache.get(managerId);

            // If not in cache
            if (!member) {

                // Try to fetch member from API
                try {

                    // Fetches member by ID
                    member = await client.baseGuild.members.fetch(managerId);

                // In case of error
                } catch (err) {
                    // ignore
                }
            };

            // Sets display name based on resolved member or unknown
            const displayName = member ? `👤 [User] ${member.user.username}${member.nickname ? ` (${member.nickname})` : ''}` : `❓ [Unknown] ${managerId}`;

            // Pushes user option to choices list
            managerChoices.push({
                name: `${displayName} - ${managerId}`,
                value: managerId
            });
        };

        // Pushes return choice option to choices list
        managerChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

        // Shows select menu to choose manager to remove
        const selectedManagerId = await select({
            message: `${currentLocale.prompts.selectManagerToRemove}:`,
            choices: managerChoices
        });

        // If a manager is selected for removal
        if (selectedManagerId !== 'return') {

            // Filters out selected manager
            const updated = currentManagers.filter(id => id !== selectedManagerId);

            // Updates managers list in database
            await client.functions.db.setConfig('system.botManagers', updated);

            // Prints success message
            console.log(`\n🟢 ${currentLocale.prompts.managerRemoved}`);

            // Waits 2 seconds
            await wait(2);
        };

        // Runs bot managers menu again
        await botManagersMenu();
    };
};

// Exports the submenu
export default botManagersMenu;

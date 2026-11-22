// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { splashLogo, loadCommands } from 'helpbot/loaders';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (beforeError) => {

    try {

        // Stores the translations of the bot
        const locale = client.locale.lib.menus[parentMenuName].submenus[menuName];

        // Function to clear the console
        async function clearConsole() {
            // Cleans the console and shows the logo
            process.stdout.write('\u001b[2J\u001b[0;0H');
            await splashLogo(client.locale.lib.loaders.splashLogo);
        };

        // Function to draw the menu
        async function drawMenu() {

            // Clears the console
            await clearConsole();
        
            // Shows an error message if one occurred
            if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
            if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

            // Gets the current module status
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.greetings');

            // Shows a text explaining the module
            console.log(`👋 ${locale.headerMessage}.\n`);
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.promptMessage}:`,
                choices: [
                    {
                        name: isModuleEnabled ? `🔴 ${locale.choices.changeModuleStatus.disable}` : `🟢 ${locale.choices.changeModuleStatus.enable}`,
                        value: 'changeModuleStatus'
                    },
                    {
                        name: `⌨️  ${locale.choices.setCommands}`,
                        value: 'setCommands'
                    },
                    {
                        name: `↩️  ${locale.choices.return}`,
                        value: 'return'
                    }
                ],
            });
        
            // When the user selects an option
            global.currentPrompt.then(async (result) => {
        
                // When the user selects an option
                switch (result) {

                    // If the user wants to change the module status
                    case 'changeModuleStatus':

                        // Changes the module status
                        await client.functions.db.setConfig('system.modules.greetings', !isModuleEnabled);
                        
                        // Redraws the menu
                        await drawMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to set the commands
                    case 'setCommands':

                        // Shows the set commands menu
                        await setCommandsMenu();

                        // Breaks the switch
                        break;
        
                    // If the user wants to go back to the main menu
                    case 'return':
                        
                        // Shows the main menu
                        await client.functions.menus.configure();
        
                        // Breaks the switch
                        break;
                };

            // When an error occurs
            }).catch(async (error) => {
            
                // Runs this menu again, passing the error
                await client.functions.menus[parentMenuName](error, menuName);

                // Logs an error message if one occurred
                logger.error(`An error occurred while loading the menu: ${error.stack}`);
            });
        };
        
        // Function to show the set commands menu
        async function setCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Shows the explanation header
            console.log(`👋 ${locale.setCommandsMenu.headerMessage}.\n`);
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.promptMessage}:`,
                choices: [
                    {
                        name: `👋 ${locale.setCommandsMenu.choices.welcomingConfig}`,
                        value: 'welcomingConfig'
                    },
                    {
                        name: `💬 ${locale.setCommandsMenu.choices.chatCommands}`,
                        value: 'chatCommands'
                    },
                    {
                        name: `↩️  ${locale.setCommandsMenu.choices.return}`,
                        value: 'return'
                    }
                ],
            });
        
            // When the user selects an option
            global.currentPrompt.then(async (result) => {
        
                // When the user selects an option
                switch (result) {

                    // If the user wants to configure welcoming settings
                    case 'welcomingConfig':

                        // Shows the welcoming configuration menu
                        await welcomingConfigMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to set the chat commands
                    case 'chatCommands':

                        // Shows the set chat commands menu
                        await setChatCommandsMenu();

                        // Breaks the switch
                        break;
        
                    // If the user wants to go back to the greetings module menu
                    case 'return':
                        
                        // Shows the main menu
                        await drawMenu();   
        
                        // Breaks the switch
                        break;
                };

            // When an error occurs
            }).catch(async (error) => {
            
                // Runs this menu again, passing the error
                await client.functions.menus[parentMenuName](error, menuName);

                // Logs an error message if one occurred
                logger.error(`An error occurred while loading the menu: ${error.stack}`);
            });
        };

        // Submenu: Welcoming Configuration
        async function welcomingConfigMenu() {

            // Clears the console
            await clearConsole();
            
            // Gets the welcoming configuration locale
            const welcomingLocale = locale.welcomingConfigMenu;

            // Shows the explanation header
            console.log(`👋 ${welcomingLocale.headerMessage}.\n`);

            // Gets the current welcomes new member mode status
            const currentMode = await client.functions.db.getConfig('welcomes.newMemberMode');

            // Gets the current welcomes new bot role ID
            const currentBotRole = await client.functions.db.getConfig('welcomes.newBotRoleId');

            // Gets the current welcomes new member role ID
            const currentMemberRole = await client.functions.db.getConfig('welcomes.newMemberRoleId');
            
            // Stores the display text for the bot role
            let botRoleText = welcomingLocale.choices.none;

            // If a new bot role ID is configured
            if (currentBotRole) {

                // Fetches the bot role from the guild cache or Discord API
                const r = await client.baseGuild.roles.cache.get(currentBotRole) || await client.baseGuild.roles.fetch(currentBotRole).catch(() => null);

                // Formats the display text with the role name or role ID
                botRoleText = r ? `@${r.name}` : `ID: ${currentBotRole}`;
            };
            
            // Stores the display text for the member role
            let memberRoleText = welcomingLocale.choices.none;

            // If a new member role ID is configured
            if (currentMemberRole) {

                // Fetches the member role from the guild cache or Discord API
                const r = await client.baseGuild.roles.cache.get(currentMemberRole) || await client.baseGuild.roles.fetch(currentMemberRole).catch(() => null);

                // Formats the display text with the role name or role ID
                memberRoleText = r ? `@${r.name}` : `ID: ${currentMemberRole}`;
            };

            // Shows the welcoming config select menu
            const welcomingAction = await select({
                message: `${welcomingLocale.promptMessage}:`,
                choices: [
                    { name: `${welcomingLocale.choices.welcomeMessageMode}: ${currentMode === 1 ? `🟢 ${welcomingLocale.choices.enabled}` : `🔴 ${welcomingLocale.choices.disabled}`}`, value: 'mode' },
                    { name: `${welcomingLocale.choices.newBotRole}: ${botRoleText}`, value: 'botRole' },
                    { name: `${welcomingLocale.choices.newMemberRole}: ${memberRoleText}`, value: 'memberRole' },
                    { name: `↩️  ${welcomingLocale.choices.return}`, value: 'return' }
                ]
            });

            // If the user wants to return to the set commands menu
            if (welcomingAction === 'return') {

                // Shows the set commands menu
                await setCommandsMenu();

                // Returns to break execution flow
                return;
            };

            // If the user wants to configure welcoming message mode
            if (welcomingAction === 'mode') {

                // Shows the selection for mode status
                const newMode = await select({
                    message: `${welcomingLocale.prompts.selectMode}:`,
                    choices: [
                        { name: `🔴 ${welcomingLocale.choices.disabled} (0)`, value: 0 },
                        { name: `🟢 ${welcomingLocale.choices.enabled} (1)`, value: 1 }
                    ]
                });

                // Updates welcomes new member mode in the database
                await client.functions.db.setConfig('welcomes.newMemberMode', newMode);

                // Shows success prompt to user
                console.log(`\n🟢 ${welcomingLocale.prompts.modeSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs the welcoming config menu again
                await welcomingConfigMenu();

            // If the user wants to configure bot role or member role
            } else if (welcomingAction === 'botRole' || welcomingAction === 'memberRole') {

                // Stores whether we are editing the bot role
                const isBotRole = welcomingAction === 'botRole';

                // Config path to store the value in the database
                const configPath = isBotRole ? 'welcomes.newBotRoleId' : 'welcomes.newMemberRoleId';

                // Shows search method selection prompt
                const searchMethod = await select({
                    message: `${welcomingLocale.prompts.selectSearchMethod}:`,
                    choices: [
                        { name: welcomingLocale.prompts.searchByName, value: 'name' },
                        { name: welcomingLocale.prompts.enterId, value: 'id' },
                        { name: welcomingLocale.prompts.clearRole, value: 'clear' }
                    ]
                });

                // If the user wants to clear the configured role
                if (searchMethod === 'clear') {

                    // Resets database config value to empty
                    await client.functions.db.setConfig(configPath, '');

                    // Shows success prompt to user
                    console.log(`\n🟢 ${welcomingLocale.prompts.clearRoleSuccess}`);

                    // Waits 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Runs welcoming config menu again
                    await welcomingConfigMenu();

                    // Returns to break execution flow
                    return;
                };

                // Stores the selected role ID
                let selectedRoleId = null;

                // If search method is by name
                if (searchMethod === 'name') {

                    // Prompts for query text
                    const query = await input({
                        message: `${welcomingLocale.prompts.enterRoleNameSearch}:`
                    });

                    // Fetches all roles in the guild
                    const roles = await client.baseGuild.roles.fetch();

                    // Filters roles by query
                    const filtered = roles.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

                    // If no roles matched the query
                    if (filtered.size === 0) {

                        // Shows error message to user
                        console.log(`\n🔴 ${welcomingLocale.prompts.noRolesFound}.`);

                        // Waits 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Runs welcoming config menu again
                        await welcomingConfigMenu();

                        // Returns to break execution flow
                        return;
                    };

                    // Maps filtered roles to choice options
                    const roleChoices = filtered.map(r => ({
                        name: `@${r.name} - ${r.id}`,
                        value: r.id
                    })).slice(0, 25);

                    // Pushes return choice option to choice list
                    roleChoices.push({ name: `↩️  ${welcomingLocale.choices.return}`, value: 'return' });

                    // Shows select menu to choose the role
                    selectedRoleId = await select({
                        message: `${welcomingLocale.prompts.selectRole}:`,
                        choices: roleChoices
                    });

                    // If the user wants to return
                    if (selectedRoleId === 'return') {

                        // Runs welcoming config menu again
                        await welcomingConfigMenu();

                        // Returns to break execution flow
                        return;
                    };

                // If search method is manually entering role ID
                } else {

                    // Prompts for the role ID string input
                    const roleId = await input({
                        message: `${welcomingLocale.prompts.enterRoleId}:`,
                        validate: v => v.trim().length > 0 ? true : 'ID cannot be empty'
                    });

                    // Fetches the role by ID from the guild cache
                    let role = client.baseGuild.roles.cache.get(roleId);

                    // If not found in cache, fetches it from API
                    if (!role) {
                        try {
                            role = await client.baseGuild.roles.fetch(roleId);
                        } catch (err) {
                            // ignores error
                        };
                    };

                    // If role still doesn't exist
                    if (!role) {

                        // Shows error message to user
                        console.log(`\n🔴 ${welcomingLocale.prompts.roleNotFound}.`);

                        // Waits 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Runs welcoming config menu again
                        await welcomingConfigMenu();

                        // Returns to break execution flow
                        return;
                    };

                    // Sets selected role ID
                    selectedRoleId = roleId;
                };

                // Updates configured welcoming role in database
                await client.functions.db.setConfig(configPath, selectedRoleId);

                // Shows success message to user
                console.log(`\n🟢 ${welcomingLocale.prompts.roleSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs welcoming config menu again
                await welcomingConfigMenu();
            };
        };

        // Function to show the chat commands menu
        async function setChatCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Shows the explanation header
            console.log(`👋 ${locale.setCommandsMenu.setChatCommandsMenu.headerMessage}.\n`);

            // Gets commands config
            const commandsConfig = await client.functions.db.getConfig('commands');

            // Filters command keys that belong to this module
            const commandKeys = Object.keys(commandsConfig.chatCommands).filter(
                cmdName => commandsConfig.chatCommands[cmdName].module === 'greetings'
            );

            // Generates choices list
            const choices = [];

            // Loops through each command key of the module
            for (const cmdName of commandKeys) {

                // Gets whether the command is enabled
                const isEnabled = commandsConfig.chatCommands[cmdName].enabled;

                // Sets the status text according to the enabled status
                const statusText = isEnabled ? `🟢 ${client.locale.status.enabled}` : `🔴 ${client.locale.status.disabled}`;

                // Gets the localized name of the command, or defaults to the key name
                const locName = client.locale.handlers.commands.chatCommands[cmdName]?.appData?.name || cmdName;

                // Pushes the command option to the choices list
                choices.push({
                    name: `${locName} [${statusText}]`,
                    value: cmdName
                });
            };

            // Adds return option to the list
            choices.push({
                name: `↩️  ${locale.setCommandsMenu.setChatCommandsMenu.choices.return}`,
                value: 'return'
            });
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.setChatCommandsMenu.promptMessage}:`,
                choices: choices,
            });
        
            // When the user selects an option
            global.currentPrompt.then(async (result) => {
        
                // If the user wants to go back to the set commands menu
                if (result === 'return') {

                    // Shows the set commands menu
                    await setCommandsMenu();

                // Otherwise, toggle the command status
                } else {

                    // Gets current status of command
                    const currentStatus = commandsConfig.chatCommands[result].enabled;

                    // Updates database config
                    await client.functions.db.setConfig(`commands.chatCommands.${result}.enabled`, !currentStatus);
                    
                    // Reloads the commands in memory
                    await loadCommands();

                    // Reloads the chat commands configuration menu
                    await setChatCommandsMenu();
                };

            // When an error occurs
            }).catch(async (error) => {
            
                // Runs this menu again, passing the error
                await client.functions.menus[parentMenuName](error, menuName);

                // Logs an error message if one occurred
                logger.error(`An error occurred while loading the menu: ${error.stack}`);
            });
        };

        // Draws the menu for the first time
        await drawMenu();

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[parentMenuName](error, menuName);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

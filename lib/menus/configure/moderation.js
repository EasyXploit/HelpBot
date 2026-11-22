// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import { setCommandStatus } from '../shared/utils.js';
import { checkBans, checkTimeouts, stopInterval, startInterval } from '../../loaders/intervals.js';

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

        // Function to ask if the user wants to expire programmed to expire sanctions, and to do it if the user wants
        async function questionIfExpireSancions() {
 
            // Clears the console
            await clearConsole();

            // Asks the user if wants to expire programmed to expire sanctions
            global.currentPrompt = await select({
                message: `${locale.choices.changeModuleStatus.wantsToExpireSanctions}:`,
                choices: [
                    {
                        name: `🟢 ${locale.choices.changeModuleStatus.affirmativeAnswer}`,
                        value: 'yes'
                    },
                    {
                        name: `🔴 ${locale.choices.changeModuleStatus.negativeAnswer}`,
                        value: 'no'
                    }
                ],
            });
        
            // If the user wants to expire programmed to expire sanctions
            if (global.currentPrompt === 'yes') {

                // Expires programmed to expire bans
                await checkBans(true);

                // Expires programmed to expire timeouts
                await checkTimeouts(true);
            };
        };

        // Function to draw the menu
        async function drawMenu() {

            // Clears the console
            await clearConsole();
        
            // Shows an error message if one occurred
            if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
            if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

            // Gets the current configuration status
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

            // Gets the current automod enabled status
            const automodEnabled = await client.functions.db.getConfig('moderation.automodEnabled');

            // Gets the current manual moderation enabled status
            const manualModerationEnabled = await client.functions.db.getConfig('moderation.manualModerationEnabled');

            // Shows a text explaining the module
            console.log(`⚖️  ${locale.headerMessage}.\n`);
        
            // Generates choices list for the moderation menu
            const choices = [
                {
                    name: isModuleEnabled ? `🔴 ${locale.choices.changeModuleStatus.disable}` : `🟢 ${locale.choices.changeModuleStatus.enable}`,
                    value: 'changeModuleStatus'
                },
                {
                    name: automodEnabled ? `🔴 ${locale.choices.changeAutomodStatus.disable}` : `🟢 ${locale.choices.changeAutomodStatus.enable}`,
                    value: 'changeAutomodStatus'
                },
                {
                    name: manualModerationEnabled ? `🔴 ${locale.choices.changeManualModerationStatus.disable}` : `🟢 ${locale.choices.changeManualModerationStatus.enable}`,
                    value: 'changeManualModerationStatus'
                },
                {
                    name: `⌨️  ${locale.choices.setCommands}`,
                    value: 'setCommands'
                },
                {
                    name: `↩️  ${locale.choices.return}`,
                    value: 'return'
                }
            ];

            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.promptMessage}:`,
                choices: choices,
            });
        
            // When the user selects an option
            global.currentPrompt.then(async (result) => {
        
                // When the user selects an option
                switch (result) {

                    // If the user wants to change the module status
                    case 'changeModuleStatus':

                        // Changes the module status
                        await client.functions.db.setConfig('system.modules.moderation', !isModuleEnabled);

                        // Gets the total bans and timeouts
                        const totalBans = (await client.functions.db.getData('ban')).length;
                        const totalTimeouts = (await client.functions.db.getData('timeout')).length;

                        // Gets the total pending to expire sanctions
                        const totalPendingToExpireSanctions = totalBans + totalTimeouts;

                        // If there are pending to expire sanctions and the module is being disabled
                        if (isModuleEnabled && totalPendingToExpireSanctions > 0) {

                            // Asks the user if wants to expire programmed to expire sanctions
                            await questionIfExpireSancions();
                        };

                        // If the module is being disabled
                        if (isModuleEnabled) {

                            // Stops the intervals that check the timeouts, the bans and the usernames
                            stopInterval('checkTimeouts');
                            stopInterval('checkBans');
                            stopInterval('checkUsernames');

                        // If the module is being enabled
                        } else {
                                
                            // Starts the intervals that check the timeouts, the bans and the usernames
                            startInterval('checkTimeouts');
                            startInterval('checkBans');
                            startInterval('checkUsernames');
                        };
                        
                        // Redraws the menu
                        await drawMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to change the automod status
                    case 'changeAutomodStatus':

                        // Changes the automod status
                        await client.functions.db.setConfig('moderation.automodEnabled', !automodEnabled);

                        // Redraws the menu
                        await drawMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to change the manual moderation status
                    case 'changeManualModerationStatus':

                        // Changes the manual moderation status
                        await client.functions.db.setConfig('moderation.manualModerationEnabled', !manualModerationEnabled);

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
            console.log(`⚖️  ${locale.setCommandsMenu.headerMessage}.\n`);
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.promptMessage}:`,
                choices: [
                    {
                        name: `🗨️  ${locale.setCommandsMenu.choices.chatCommands}`,
                        value: 'chatCommands'
                    },
                    {
                        name: `✉️  ${locale.setCommandsMenu.choices.messageCommands}`,
                        value: 'messageCommands'
                    },
                    {
                        name: `👤 ${locale.setCommandsMenu.choices.userCommands}`,
                        value: 'userCommands'
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

                    // If the user wants to set the chat commands
                    case 'chatCommands':

                        // Shows the set chat commands menu
                        await setChatCommandsMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to set the message commands
                    case 'messageCommands':

                        // Shows the set message commands menu
                        await setMessageCommandsMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to set the user commands
                    case 'userCommands':

                        // Shows the set user commands menu
                        await setUserCommandsMenu();

                        // Breaks the switch
                        break;
        
                    // If the user wants to go back to the moderation module menu
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

        // Function to show the chat commands menu
        async function setChatCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Shows the explanation header
            console.log(`⚖️  ${locale.setCommandsMenu.setChatCommandsMenu.headerMessage}.\n`);

            // Gets commands config
            const commandsConfig = await client.functions.db.getConfig('commands');

            // Filters command keys that belong to this module
            const commandKeys = Object.keys(commandsConfig.chatCommands).filter(
                cmdName => commandsConfig.chatCommands[cmdName].module === 'moderation'
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

                    // Enables or disables the command (in the database and in the loaded commands)
                    await setCommandStatus('chatCommands', result, !currentStatus);

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

        // Function to show the message commands menu
        async function setMessageCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Shows the explanation header
            console.log(`⚖️  ${locale.setCommandsMenu.setMessageCommandsMenu.headerMessage}.\n`);

            // Gets commands config
            const commandsConfig = await client.functions.db.getConfig('commands');

            // Filters command keys that belong to this module
            const commandKeys = Object.keys(commandsConfig.messageCommands).filter(
                cmdName => commandsConfig.messageCommands[cmdName].module === 'moderation'
            );

            // Generates choices list
            const choices = [];

            // Loops through each command key of the module
            for (const cmdName of commandKeys) {

                // Gets whether the command is enabled
                const isEnabled = commandsConfig.messageCommands[cmdName].enabled;

                // Sets the status text according to the enabled status
                const statusText = isEnabled ? `🟢 ${client.locale.status.enabled}` : `🔴 ${client.locale.status.disabled}`;

                // Gets the localized name of the command, or defaults to the key name
                const locName = client.locale.handlers.commands.messageCommands[cmdName]?.appData?.name || cmdName;

                // Pushes the command option to the choices list
                choices.push({
                    name: `${locName} [${statusText}]`,
                    value: cmdName
                });
            };

            // Adds return option to the list
            choices.push({
                name: `↩️  ${locale.setCommandsMenu.setMessageCommandsMenu.choices.return}`,
                value: 'return'
            });
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.setMessageCommandsMenu.promptMessage}:`,
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
                    const currentStatus = commandsConfig.messageCommands[result].enabled;

                    // Enables or disables the command (in the database and in the loaded commands)
                    await setCommandStatus('messageCommands', result, !currentStatus);

                    // Reloads the message commands configuration menu
                    await setMessageCommandsMenu();
                };

            // When an error occurs
            }).catch(async (error) => {
            
                // Runs this menu again, passing the error
                await client.functions.menus[parentMenuName](error, menuName);

                // Logs an error message if one occurred
                logger.error(`An error occurred while loading the menu: ${error.stack}`);
            });
        };

        // Function to show the user commands menu
        async function setUserCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Shows the explanation header
            console.log(`⚖️  ${locale.setCommandsMenu.setUserCommandsMenu.headerMessage}.\n`);

            // Gets commands config
            const commandsConfig = await client.functions.db.getConfig('commands');

            // Filters command keys that belong to this module
            const commandKeys = Object.keys(commandsConfig.userCommands).filter(
                cmdName => commandsConfig.userCommands[cmdName].module === 'moderation'
            );

            // Generates choices list
            const choices = [];

            // Loops through each command key of the module
            for (const cmdName of commandKeys) {

                // Gets whether the command is enabled
                const isEnabled = commandsConfig.userCommands[cmdName].enabled;

                // Sets the status text according to the enabled status
                const statusText = isEnabled ? `🟢 ${client.locale.status.enabled}` : `🔴 ${client.locale.status.disabled}`;

                // Gets the localized name of the command, or defaults to the key name
                const locName = client.locale.handlers.commands.userCommands[cmdName]?.appData?.name || cmdName;

                // Pushes the command option to the choices list
                choices.push({
                    name: `${locName} [${statusText}]`,
                    value: cmdName
                });
            };

            // Adds return option to the list
            choices.push({
                name: `↩️  ${locale.setCommandsMenu.setUserCommandsMenu.choices.return}`,
                value: 'return'
            });
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.setUserCommandsMenu.promptMessage}:`,
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
                    const currentStatus = commandsConfig.userCommands[result].enabled;

                    // Enables or disables the command (in the database and in the loaded commands)
                    await setCommandStatus('userCommands', result, !currentStatus);

                    // Reloads the user commands configuration menu
                    await setUserCommandsMenu();
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

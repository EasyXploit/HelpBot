// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { clearConsole, getStatusText, setCommandStatus } from '../shared/utils.js';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (beforeError) => {

    try {

        // Stores the translations of the bot
        const locale = client.locale.lib.menus[parentMenuName].submenus[menuName];

        // Function to draw the menu
        async function drawMenu() {

            // Clears the console
            await clearConsole();
        
            // Shows an error message if one occurred
            if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
            if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

            // Gets the current module status
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.utilities');

            // Shows a text explaining the module
            console.log(`🛠️  ${locale.headerMessage}.\n`);
        
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
                        await client.functions.db.setConfig('system.modules.utilities', !isModuleEnabled);
                        
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
            console.log(`🛠️  ${locale.setCommandsMenu.headerMessage}.\n`);
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.promptMessage}:`,
                choices: [
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

                    // If the user wants to set the chat commands
                    case 'chatCommands':

                        // Shows the set chat commands menu
                        await setChatCommandsMenu();

                        // Breaks the switch
                        break;
        
                    // If the user wants to go back to the utilities module menu
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
            console.log(`🛠️  ${locale.setCommandsMenu.setChatCommandsMenu.headerMessage}.\n`);

            // Gets commands config
            const commandsConfig = await client.functions.db.getConfig('commands');

            // Filters command keys that belong to this module
            const commandKeys = Object.keys(commandsConfig.chatCommands).filter(
                cmdName => commandsConfig.chatCommands[cmdName].module === 'utilities'
            );

            // Generates choices list
            const choices = [];

            // Loops through each command key of the module
            for (const cmdName of commandKeys) {

                // Gets whether the command is enabled
                const isEnabled = commandsConfig.chatCommands[cmdName].enabled;

                // Sets the status text according to the enabled status
                const statusText = getStatusText(isEnabled);

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

        // Draws the menu for the first time
        await drawMenu();

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[parentMenuName](error, menuName);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import { loadScheduledMessages } from 'helpbot/loaders';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[parentMenuName].submenus[menuName];

// Exports a default function
export default async (beforeError) => {

    try {

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
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.scheduledMessages');

            // Shows a text explaining the module
            console.log(`🕒 ${locale.headerMessage}.\n`);
        
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
                        await client.functions.db.setConfig('system.modules.scheduledMessages', !isModuleEnabled);

                        // If the module is being disabled
                        if (isModuleEnabled) {

                            // If there are scheduled messages, clears them
                            if (client.scheduledMessageIntervals && client.scheduledMessageIntervals.length > 0) await client.scheduledMessageIntervals.forEach(interval => clearInterval(interval));

                            // Clears the array of intervals
                            client.scheduledMessageIntervals = [];

                        // If the module is being enabled
                        } else {
                            
                            // Loads the scheduled messages, if some are configured
                            if (await client.functions.db.getConfig('system.modules.scheduledMessages')) await loadScheduledMessages();
                        };

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
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.promptMessage}:`,
                choices: [
                    {
                        name: `🗨️  ${locale.setCommandsMenu.choices.chatCommands}`,
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

            // Gets the chat commands locales
            const chatCommandsLocales = client.locale.handlers.commands.chatCommands;
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.setChatCommandsMenu.promptMessage}:`,
                choices: [
                    {
                        name: `↩️  ${locale.setCommandsMenu.setChatCommandsMenu.choices.return}`,
                        value: 'return'
                    }
                ],
            });
        
            // When the user selects an option
            global.currentPrompt.then(async (result) => {
        
                // When the user selects an option
                switch (result) {
        
                    // If the user wants to go back to the set commands menu
                    case 'return':
                        
                        // Shows the set commands menu
                        await setCommandsMenu();   
        
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

        // Draws the menu for the first time
        await drawMenu();

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[parentMenuName](error, menuName);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

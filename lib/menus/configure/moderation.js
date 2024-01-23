// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import { checkBans, checkTimeouts, stopInterval, startInterval } from '../../loaders/intervals.js';

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

            // Gets the current module status
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

            // Shows a text explaining the module
            console.log(`⚖️  ${locale.headerMessage}.\n`);
        
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
                        await client.functions.db.setConfig('system.modules.moderation', !isModuleEnabled);

                        // Gets the total bans and timeouts
                        const totalBans = (await client.functions.db.getData('ban')).length
                        const totalTimeouts = (await client.functions.db.getData('timeout')).length

                        // Gets the total pending to expire sanctions
                        const totalPendingToExpireSanctions = totalBans + totalTimeouts;

                        // If there are pending to expire sanctions and the module is being disabled
                        if (isModuleEnabled && totalPendingToExpireSanctions > 0) {

                            // Asks the user if wants to expire programmed to expire sanctions
                            await questionIfExpireSancions();
                        };

                        // If the module is being disabled
                        if (isModuleEnabled) {

                            //Stops the interval that checks the usernames
                            stopInterval('checkUsernames');

                        // If the module is being enabled
                        } else {
                                
                            // Starts the interval that checks the usernames
                            startInterval('checkUsernames');
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

        // Function to show the message commands menu
        async function setMessageCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Gets the message commands locales
            const messageCommandsLocales = client.locale.handlers.commands.messageCommands;
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.setMessageCommandsMenu.promptMessage}:`,
                choices: [
                    {
                        name: `↩️  ${locale.setCommandsMenu.setMessageCommandsMenu.choices.return}`,
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

        // Function to show the user commands menu
        async function setUserCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Gets the user commands locales
            const userCommandsLocales = client.locale.handlers.commands.userCommands;
        
            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.setCommandsMenu.setUserCommandsMenu.promptMessage}:`,
                choices: [
                    {
                        name: `↩️  ${locale.setCommandsMenu.setUserCommandsMenu.choices.return}`,
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

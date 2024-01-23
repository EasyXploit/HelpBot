// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import { checkPolls, stopInterval, startInterval } from '../../loaders/intervals.js';

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

        // Function to ask if the user wants to expire programmed to expire polls, and to do it if the user wants
        async function questionIfExpirePolls() {
 
            // Clears the console
            await clearConsole();

            // Asks the user if wants to expire programmed to expire polls
            global.currentPrompt = await select({
                message: `${locale.choices.changeModuleStatus.wantsToExpirePolls}:`,
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
        
            // If the user wants to expire programmed to expire polls
            if (global.currentPrompt === 'yes') {

                // Expires programmed to expire polls
                await checkPolls(true);
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
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.polls');

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
                        await client.functions.db.setConfig('system.modules.polls', !isModuleEnabled);

                        // Gets the total pending to expire polls
                        const totalPolls = (await client.functions.db.getData('poll')).length;

                        // If there are pending to expire polls and the module is being disabled
                        if (isModuleEnabled && totalPolls > 0) {

                            // Asks the user if wants to expire programmed to expire polls
                            await questionIfExpirePolls();
                        };

                        // If the module is being disabled
                        if (isModuleEnabled) {

                            //Stops the interval that checks the polls
                            stopInterval('checkPolls');

                        // If the module is being enabled
                        } else {
                                
                            // Starts the interval that checks the polls
                            startInterval('checkPolls');
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

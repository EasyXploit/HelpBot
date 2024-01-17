// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
const fs = require('fs');
const path = require('path');

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[menuName];

// Exports a default function
export default async (beforeError) => {

    try {

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

        // Verifies if the logs directory exists
        if (fs.existsSync('./logs')) {

            // Obtains the names of the files in the logs directory
            const fileNames = fs.readdirSync('./logs');

            // Verifies if there are log files with the .log extension
            const logFiles = fileNames.filter((fileName) => fileName.endsWith('.log'));

            // If there are log files
            if (logFiles.length > 0) {

                // For each log file
                for (const logFileName of logFiles) {

                    // Obtains the path of the log file
                    const logFilePath = path.join('./logs', logFileName);

                    // Creates a read stream of the log file
                    const logStream = fs.createReadStream(logFilePath, { encoding: 'utf8' });

                    // Prints the name of the log file
                    console.log(`📄 ${logFileName}:\n`);

                    // Generates a promise to wait for the stream to end
                    await new Promise((resolve) => {

                        // For each line of the log file
                        logStream.on('data', (data) => {

                            // Shows the line on the console
                            console.log(data);
                        });

                        // When the stream ends
                        logStream.on('end', () => {

                            // Resolves the promise
                            resolve();
                        });
                    });
                };
                
            } else {

                // If there are no log files, shows a message
                console.log(`📭 ${await client.functions.utils.parseLocale(locale.noStoredLogs)}.\n`);
            };

        } else {

            // If the directory doesn't exist, shows a message
            console.log(`📭 ${await client.functions.utils.parseLocale(locale.noStoredLogs)}.\n`);
        };
    
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
                {
                    name: `🔄 ${locale.choices.refresh}`,
                    value: 'refresh'
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
    
                // If the user wants to refresh the menu
                case 'refresh':
                    
                    // Shows the logs menu again
                    await client.functions.menus.logs();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to go back to the main menu
                case 'return':
                    
                    // Shows the main menu
                    await client.functions.menus.main();
    
                    // Breaks the switch
                    break;
            };

        // When an error occurs
        }).catch(async (error) => {
        
            // Runs this menu again, passing the error
            await client.functions.menus[menuName](error);

            // Logs an error message if one occurred
            logger.error(`An error occurred while loading the menu: ${error.stack}`);
        });

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[menuName](error);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

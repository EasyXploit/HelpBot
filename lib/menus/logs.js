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

        // Verifica si el directorio de logs existe
        if (fs.existsSync('./logs')) {

            // Obtiene la lista de nombres de archivo en el directorio de logs
            const fileNames = fs.readdirSync('./logs');

            // Verifica si hay archivos de log dada la extensión
            const logFiles = fileNames.filter((fileName) => fileName.endsWith('.log'));

            // Si hay archivos de log
            if (logFiles.length > 0) {

                // Por cada archivo de log
                for (const logFileName of logFiles) {

                    //  Obtiene la ruta del archivo de log
                    const logFilePath = path.join('./logs', logFileName);

                    // Crea un stream de lectura del archivo de log
                    const logStream = fs.createReadStream(logFilePath, { encoding: 'utf8' });

                    // Genera una promesa que se resuelve cuando el stream termina
                    await new Promise((resolve) => {

                        // Por cada línea del archivo de log
                        logStream.on('data', (data) => {

                            // Muestra la línea en la consola
                            console.log(data);
                        });

                        // Cuando el stream termina
                        logStream.on('end', () => {

                            // Resuelve la promesa
                            resolve();
                        });
                    });
                };

            } else {

                // Si no hay archivos de log, muestra un mensaje
                console.log(`🚧 ${await client.functions.utils.parseLocale(locale.noStoredLogs)}.\n`);
            };

        } else {

            // Si no existe el directorio de logs, muestra un mensaje
            console.log(`🚧 ${await client.functions.utils.parseLocale(locale.noStoredLogs)}.\n`);
        };
    
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
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
        });

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[menuName](error);
    };
};

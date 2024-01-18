// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import AutoGitUpdate from 'auto-git-update';

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[menuName];

// Exports a default function
export default async (beforeError, forceUpdate) => {

    try {

        // Stores the local configuration from the configuration file
        let localConfig = require('./config.json');

        // Function to show the post-update check menu
        async function showPostUpdateCheckMenu() {

            // Shows the select menu
            global.currentPrompt = select({
                message: `${locale.promptMessage}:`,
                choices: [
                    {
                        name: `🔎 ${locale.choices.checkAgain}`,
                        value: 'checkAgain'
                    },
                    {
                        name: `${ localConfig.betaEnabled ? `🏠 ${locale.choices.switchToStable}` : `🧪 ${locale.choices.switchToBeta}`}`,
                        value: 'switchVersion'
                    },
                    {
                        name: `↩️  ${locale.choices.return}`,
                        value: 'return'
                    }
                ],
            });
        
            // When the user selects an option
            global.currentPrompt.then(async (result) => {
        
                // Switches between the options
                switch (result) {
        
                    // If the user wants to check again for updates
                    case 'checkAgain':
                        
                        // Shows this menu again
                        await client.functions.menus.update();
        
                        // Breaks the switch
                        break;
        
                    // If the user wants to change it's version
                    case 'switchVersion':
                        
                        // Changes the betaEnabled value
                        localConfig.betaEnabled = localConfig.betaEnabled ? false : true;

                        // Saves the new configuration
                        await fs.writeFileSync('./config.json', JSON.stringify(localConfig, null, 4));

                        // Shows this menu again, passing the forceUpdate parameter based on the new value
                        await client.functions.menus.update(null, localConfig.betaEnabled ? false : true);
        
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
            });
        };

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);

        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

        try {

            // Shows a message indicating that the bot is checking for updates
            console.log(`🔎 ${locale.checkingForUpdates} ...`);

            // Logs a message indicating that the bot is checking for updates
            logger.debug('Checking for updates ...');
    
            // Loads the repository configuration
            const packageConfig = require('./package.json');

            // Obtains the repository URL
            let repoUrl = packageConfig.repository.url;

            // Removes the unnecessary parts from the URL
            repoUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');

            // Imports the necessary libraries to obtain the temporary directory
            const os = require('os');
            const path = require('path');

            // Obtains the temporary directory
            const tempDirectory = os.tmpdir();

            // Creates the temporary directory for the app
            const appTempDirectory = path.join(tempDirectory, packageConfig.normalizedName);

            // Generates the configuration for the updater
            const updateConfiguration = {
                repository: repoUrl,                                                            // Uses the repository URL
                fromReleases: true,                                                            // Uses the releases based on the selected branch (exclucing pre-releases)
                branch: localConfig.betaEnabled = localConfig.betaEnabled ? 'beta' : 'master',  // Uses the beta branch if the betaEnabled value is true, otherwise uses the master branch
                tempLocation: appTempDirectory,                                                 // Uses the temporary directory for the app
                logConfig: {                                                                    // Configuration for the logs
                    logGeneral: process.env.NODE_ENV !== 'production' ? true : false,           // Logs general information if the environment is not production
                    prefix: `${packageConfig.normalizedName} - `                                // Prefix for the logs
                }
            }

            // Logs a message indicating the configuration that will be used (only repo, fromReleases, branch and tempLocation, in a string format, not json)
            logger.debug(`The update will be fetched from ${updateConfiguration.repository} (fromReleases: ${updateConfiguration.fromReleases}, branch: ${updateConfiguration.branch}, tempLocation: ${updateConfiguration.tempLocation})`);

            // Creates a new instance of the updater
            const updater = new AutoGitUpdate(updateConfiguration);

            // Fetches the update status from the repository
            const updateStatus = await updater.compareVersions();

            // If the bot is not updated
            if (!updateStatus.upToDate) {

                // Logs a message indicating that the bot is not updated
                logger.debug(`The bot is not updated (current version: ${updateStatus.currentVersion}, remote version: ${updateStatus.remoteVersion})`);

                // Function to update the bot
                async function updateBot() {

                    // Indicates that the bot is not ready to handle events
                    global.readyStatus = false;

                    // Cleans the console and shows the logo
                    process.stdout.write('\u001b[2J\u001b[0;0H');
                    await splashLogo(client.locale.lib.loaders.splashLogo);

                    // Shows a message indicating that the bot is downloading the new version
                    console.log(`⬇️  ${await client.functions.utils.parseLocale(locale.downloadingNewVersion, { targetVersion: `v${updateStatus.remoteVersion}`, repositoryURL: repoUrl })} ...`);

                    // Logs a message indicating that the bot is downloading the new version
                    logger.debug(`Downloading version ${updateStatus.remoteVersion} from ${repoUrl} ...`);

                    try {
    
                        // Updates the bot
                        await updater.autoUpdate();
                        
                        // Cleans the console and shows the logo
                        process.stdout.write('\u001b[2J\u001b[0;0H');
                        await splashLogo(client.locale.lib.loaders.splashLogo);

                        // Shows a message indicating that the bot has been updated
                        console.log(`🎉 ${await client.functions.utils.parseLocale(locale.updatedCorrectly, { targetVersion: `v${updateStatus.remoteVersion}` })}\n`);

                        // Logs a message indicating that the bot has been updated
                        logger.debug(`The bot has been updated to version ${updateStatus.remoteVersion}. User interaction will be required to restart the bot.`);

                        // Shows a message indicating that the bot needs to be restarted in order to apply the changes
                        console.log(`${locale.needsRestart}.\n`);

                        // Shows the select menu to ask the user if wants to update the bot
                        global.currentPrompt = select({
                            
                            message: `${locale.restartConfirmationPrompt.message}:`,
                            choices: [
                                {
                                    name: `🔄 ${locale.restartConfirmationPrompt.restartNow}`,
                                    value: 'restart'
                                }
                            ],
                        });
                    
                        // When the user selects an option
                        global.currentPrompt.then(async (result) => {
                    
                            // If the user wants to restart now, restarts the bot
                            if (result === 'restart') process.exit(0);

                        // When an error occurs
                        }).catch(async (error) => {

                            // Runs this menu again, passing the error
                            await client.functions.menus[menuName](error);
                        });
        
                        // Waits 30 seconds before exiting the process
                        await new Promise(resolve => setTimeout(resolve, 30000));

                        // Exits the process
                        process.exit(0);

                    } catch (error) {

                        // Logs an error message if one occurred
                        throw new Error(`An error occurred while updating the bot: ${error.stack}`);
                    };
                };

                // Shows a message indicating that there are new updates
                if (!forceUpdate) {

                    // Function to obtain the release notes from the GitHub repository
                    function getReleaseNotes(owner, repository, tagName) {

                        // Logs a message indicating that the bot is obtaining the release notes
                        logger.debug(`Obtaining release notes from ${owner}/${repository} for tag ${tagName} ...`);

                        // Imports the necessary libraries
                        const https = require('https');

                        // Returns a promise to obtain the release notes
                        return new Promise((resolve, reject) => {
                            const options = {
                                hostname: 'api.github.com',
                                path: `/repos/${owner}/${repository}/releases/tags/${tagName}`,
                                method: 'GET',
                                headers: {
                                    'User-Agent': 'NodeJS'
                                }
                            };

                            // Makes the request
                            const request = https.request(options, (response) => {

                                // Stores the data
                                let data = '';

                                // When a chunk of data is received
                                response.on('data', (chunk) => {

                                    // Stores the chunk
                                    data += chunk;
                                });

                                // When the response ends
                                response.on('end', () => {

                                    // If the response was OK
                                    if (response.statusCode === 200) {

                                        // Logs a message indicating that the release notes have been obtained
                                        logger.debug(`Release notes obtained from ${owner}/${repository} for tag ${tagName}`);

                                        // Parses the data
                                        const jsonData = JSON.parse(data);

                                        // Resolves the promise with the body of the response
                                        resolve(jsonData.body);

                                    } else {

                                        // Logs a message indicating that the release notes could not be obtained
                                        logger.debug(`Release notes could not be obtained from ${owner}/${repository} for tag ${tagName}`);

                                        // Rejects the promise with the error
                                        if (response.statusCode !== 404) return reject(new Error(`Received status code ${response.statusCode}`));

                                        // Resolves the promise with a default message
                                        resolve(locale.noReleaseNotes);
                                    };
                                });
                            });

                            // When an error occurs
                            request.on('error', (error) => {

                                // Rejects the promise with the error
                                reject(error);
                            });

                            // Ends the request
                            request.end();
                        });
                    };

                    // Cleans the console and shows the logo
                    process.stdout.write('\u001b[2J\u001b[0;0H');
                    await splashLogo(client.locale.lib.loaders.splashLogo);

                    // Shows a message indicating that there are new updates
                    console.log(`🆕 ${await client.functions.utils.parseLocale(locale.newVersionAvailable, { targetVersion: updateStatus.remoteVersion })}\n`);

                    // Logs a message indicating that there are new updates
                    logger.debug(`There are new updates available (current version: ${updateStatus.currentVersion}, remote version: ${updateStatus.remoteVersion})`);

                    // Uses a regular expression to obtain the owner and repository name from the URL
                    const repositoryMetadata = packageConfig.repository.url.match(/github\.com\/([^\/]+)\/([^\/]+)\.git/);
    
                    // Stores the owner and repository name
                    const repositoryOwner = repositoryMetadata[1];
                    const repositoryName = repositoryMetadata[2];
    
                    // Obtains the release notes
                    await getReleaseNotes(repositoryOwner, repositoryName, updateStatus.remoteVersion).then(releaseNotes => {

                        // Shows the release notes
                        console.log(`${locale.releaseNotes}:\n${releaseNotes}\n`);

                        // Logs a message indicating that the release notes have been shown
                        logger.debug(`Release notes for version ${updateStatus.remoteVersion} have been shown. Waiting for user interaction ...`);

                    }).catch(error => {

                        // Shows an error message if one occurred
                        console.log(`❌ ${locale.releaseNotesError}\n`);
    
                        // Logs an error message if one occurred
                        logger.error(`An error occurred while obtaining the release notes: ${error.stack}`);
                    });

                    // Shows the select menu to ask the user if wants to update the bot
                    global.currentPrompt = select({
                        message: `${locale.updateConfirmationPromptMessage}:`,
                        choices: [
                            {
                                name: `✅ ${locale.updateConfirmationChoices.yes}`,
                                value: 'yes'
                            },
                            {
                                name: `❌ ${locale.updateConfirmationChoices.no}`,
                                value: 'no'
                            }
                        ],
                    });
                
                    // When the user selects an option
                    await global.currentPrompt.then(async (result) => {

                        // Cleans the console and shows the logo
                        process.stdout.write('\u001b[2J\u001b[0;0H');
                        await splashLogo(client.locale.lib.loaders.splashLogo);
                
                        // If the user wants to update the bot, updates it
                        if (result === 'yes') await updateBot();

                    // When an error occurs
                    }).catch(async (error) => {

                        // Runs this menu again, passing the error
                        await client.functions.menus[menuName](error);
                    });

                } else {

                    // Logs a message indicating that the bot is updating without asking the user
                    logger.debug('Forcing the update without asking the user ...');
                    
                    // Updates the bot without asking the user
                    await updateBot();
                };
    
            } else {

                // Cleans the console and shows the logo
                process.stdout.write('\u001b[2J\u001b[0;0H');
                await splashLogo(client.locale.lib.loaders.splashLogo);

                // If the bot could not obtain the remote version
                if (!updateStatus.remoteVersion) {

                    // Shows a message indicating that the bot could not obtain the remote version
                    console.log(`❌ ${locale.couldNotFetchUpdate}.\n`);

                    // Logs a message indicating that the bot could not obtain the remote version
                    logger.debug(`The bot could not obtain the remote version of the ${updateConfiguration.branch} branch (current version: ${updateStatus.currentVersion})`);

                // If the bot is updated to the latest version
                } else {

                    // Shows a message indicating that the bot is updated to the latest version
                    console.log(`✅ ${locale.alreadyUpdated}: v${updateStatus.currentVersion}\n`);
    
                    // Logs a message indicating that the bot is updated to the latest version
                    logger.debug(`The bot is updated to the latest available version of the ${updateConfiguration.branch} branch (current version: ${updateStatus.currentVersion}, remote version: ${updateStatus.remoteVersion})`);
                };
            };

            // Shows the post-update check menu
            await showPostUpdateCheckMenu();

        } catch (error) {

            // Shows an error message if one occurred
            console.error("❌ An error ocurred during the update process:", error.stack);

            // Logs an error message if one occurred
            logger.error(`An error occurred while checking for updates: ${error.stack}`);
        };

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[menuName](error);

        // Logs an error message if one occurred
        logger.error(`An error occurred while loading the menu: ${error.stack}`);
    };
};

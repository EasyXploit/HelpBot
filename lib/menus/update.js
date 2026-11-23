// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { clearConsole, wait } from './shared/utils.js';
import AutoGitUpdate from 'auto-git-update';
import compareVersions, { parseVersion } from '../utils/compareVersions.js';

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
        await clearConsole();

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

            // Obtains the owner and the name of the repository from its URL
            const [, repositoryOwner, repositoryName] = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)$/);

            // Stores the update channel: beta (that also receives the pre-releases) or stable
            const channel = localConfig.betaEnabled ? 'beta' : 'stable';

            // Function to obtain the newest release of the channel from GitHub (by version, as the releases of both channels are mixed), or null if there is none or it could not be obtained
            async function getLatestRelease() {

                try {

                    // Obtains the releases of the repository
                    const response = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/releases?per_page=100`, { headers: { 'User-Agent': packageConfig.normalizedName, 'Accept': 'application/vnd.github+json' } });

                    // If the releases could not be obtained, logs it and returns null
                    if (!response.ok) {
                        logger.debug(`The releases could not be obtained from ${repositoryOwner}/${repositoryName} (status code ${response.status})`);
                        return null;
                    };

                    // Stores the published releases of the channel (the stable channel does not receive the pre-releases), whose tag is a valid version
                    const releases = (await response.json()).filter(release => !release.draft && (channel === 'beta' || !release.prerelease) && parseVersion(release.tag_name));

                    // Returns the release with the newest version
                    return releases.reduce((newest, release) => !newest || compareVersions(release.tag_name, newest.tag_name) > 0 ? release : newest, null);

                } catch (error) {

                    // Logs that the releases could not be obtained, and returns null
                    logger.debug(`The releases could not be obtained from ${repositoryOwner}/${repositoryName}: ${error.message}`);
                    return null;
                };
            };

            // Obtains the newest release of the channel
            const latestRelease = await getLatestRelease();

            // Stores the current and the remote versions
            const currentVersion = packageConfig.version;
            const remoteVersion = latestRelease ? latestRelease.tag_name.replace(/^v/, '') : null;

            // Stores whether there is an update: a newer version or, when switching the channel, a different one (as the stable version can be older than the beta one)
            const updateAvailable = !!remoteVersion && (forceUpdate ? compareVersions(remoteVersion, currentVersion) !== 0 : compareVersions(remoteVersion, currentVersion) > 0);

            // If there is an update
            if (updateAvailable) {

                // Logs a message indicating that the bot is not updated
                logger.debug(`The bot is not updated (current version: ${currentVersion}, remote version: ${remoteVersion}, channel: ${channel})`);

                // Function to update the bot
                async function updateBot() {

                    // Indicates that the bot is not ready to handle events
                    global.readyStatus = false;

                    // Cleans the console and shows the logo
                    await clearConsole();

                    // Shows a message indicating that the bot is downloading the new version
                    console.log(`⬇️  ${await client.functions.utils.parseLocale(locale.downloadingNewVersion, { targetVersion: `v${remoteVersion}`, repositoryURL: repoUrl })} ...`);

                    // Logs a message indicating that the bot is downloading the new version
                    logger.debug(`Downloading version ${remoteVersion} from ${repoUrl} ...`);

                    try {
    
                        // Creates a new instance of the updater, that downloads the release (by its tag)
                        const updater = new AutoGitUpdate({
                            repository: repoUrl,                                                        // Uses the repository URL
                            branch: latestRelease.tag_name,                                             // Uses the tag of the release
                            tempLocation: appTempDirectory,                                             // Uses the temporary directory for the app
                            logConfig: {                                                                // Configuration for the logs
                                logGeneral: process.env.NODE_ENV !== 'production' ? true : false,       // Logs general information if the environment is not production
                                prefix: `${packageConfig.normalizedName} - `                            // Prefix for the logs
                            }
                        });

                        // Updates the bot, and throws an error if it could not be updated
                        if (!await updater.forceUpdate()) throw new Error('The update could not be installed (the updater logged the reason)');
                        
                        // Cleans the console and shows the logo
                        await clearConsole();

                        // Shows a message indicating that the bot has been updated
                        console.log(`🎉 ${await client.functions.utils.parseLocale(locale.updatedCorrectly, { targetVersion: `v${remoteVersion}` })}\n`);

                        // Logs a message indicating that the bot has been updated
                        logger.debug(`The bot has been updated to version ${remoteVersion}. User interaction will be required to restart the bot.`);

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
                            if (result === 'restart') await client.functions.utils.shutdown();

                        // When an error occurs
                        }).catch(async (error) => {

                            // Runs this menu again, passing the error
                            await client.functions.menus[menuName](error);
                        });
        
                        // Waits 30 seconds before exiting the process
                        await wait(30);

                        // Shuts down the bot gracefully
                        await client.functions.utils.shutdown();

                    } catch (error) {

                        // Logs an error message if one occurred
                        throw new Error(`An error occurred while updating the bot: ${error.stack}`);
                    };
                };

                // Shows a message indicating that there are new updates
                if (!forceUpdate) {

                    // Cleans the console and shows the logo
                    await clearConsole();

                    // Shows a message indicating that there are new updates
                    console.log(`🆕 ${await client.functions.utils.parseLocale(locale.newVersionAvailable, { targetVersion: `v${remoteVersion}` })}\n`);

                    // Logs a message indicating that there are new updates
                    logger.debug(`There are new updates available (current version: ${currentVersion}, remote version: ${remoteVersion})`);

                    // Shows the release notes (or that there are none)
                    console.log(`${locale.releaseNotes}:\n${latestRelease.body && latestRelease.body.trim().length > 0 ? latestRelease.body.trim() : locale.noReleaseNotes}\n`);

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
                        await clearConsole();
                
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
                await clearConsole();

                // If the bot could not obtain the remote version
                if (!remoteVersion) {

                    // Shows a message indicating that the bot could not obtain the remote version
                    console.log(`❌ ${locale.couldNotFetchUpdate}.\n`);

                    // Logs a message indicating that the bot could not obtain the remote version
                    logger.debug(`The bot could not obtain the newest release of the ${channel} channel (current version: ${currentVersion})`);

                // If the bot is updated to the latest version
                } else {

                    // Shows a message indicating that the bot is updated to the latest version
                    console.log(`✅ ${locale.alreadyUpdated}: v${currentVersion}\n`);
    
                    // Logs a message indicating that the bot is updated to the latest version
                    logger.debug(`The bot is updated to the latest available version of the ${channel} channel (current version: ${currentVersion}, remote version: ${remoteVersion})`);
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

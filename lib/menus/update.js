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
    
            // Loads the repository configuration
            const packageConfig = require('./package.json');
    
            // Sets the latest local tag as the current version from the package
            let latestLocalTag = packageConfig.version;

            // Imports the necessary libraries
            const simpleGit = require('simple-git');
    
            // Creates a new instance of simple-git
            const git = simpleGit();
    
            // Fetches the latest tags and prunes the old tags
            await git.fetch(['--force', '--prune', '--tags']);
            
            // Gets the remote tags list
            const remoteTagLines = (await git.listRemote(['--tags'])).split('\n');

            // Maps the remote tags list to an array of tag names
            let remoteTags = remoteTagLines.map(line => {

                // Extracts the tag name from the line
                const match = line.match(/refs\/tags\/(.+)$/);

                // Returns the tag name or null if it doesn't exist
                return match ? match[1] : null;
            
            // Filters out null values
            }).filter(tag => tag !== null);
        
            // Gets the local tags list and filters out empty values
            const localTags = (await git.tag(['--list'])).split('\n').filter(tag => tag.trim() !== '');
        
            // Filters out tags that exist locally but not remotely
            const tagsToDelete = localTags.filter(tag => !remoteTags.includes(tag) && tag);
        
            // Deletes these non-existent tags
            for (const tag of tagsToDelete) await git.tag(['-d', tag]);

            // If the beta versions are disabled, removes them from the array
            if (remoteTags && !localConfig.betaEnabled) remoteTags = remoteTags.filter(tag => !tag.includes('beta'));

            // Obtains the latest remote tag
            const latestRemoteTag = remoteTags[remoteTags.length - 1];

            // Compares the local and remote tags
            if (latestRemoteTag && latestRemoteTag.length > 0 && latestLocalTag !== latestRemoteTag) {

                // Function to update the bot
                async function updateBot() {

                    // Indicates that the bot is not ready to handle events
                    global.readyStatus = false;

                    // Cleans the console and shows the logo
                    process.stdout.write('\u001b[2J\u001b[0;0H');
                    await splashLogo(client.locale.lib.loaders.splashLogo);

                    // Obtains the repository URL
                    let repoUrl = packageConfig.repository.url;

                    // Removes the unnecessary parts from the URL
                    repoUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');

                    // Shows a message indicating that the bot is downloading the new version
                    console.log(`⬇️  ${await client.functions.utils.parseLocale(locale.downloadingNewVersion, { targetVersion: `v${latestRemoteTag}`, repositoryURL: repoUrl })} ...`);

                    try {

                        // Generates athe configuration for the updater
                        const updateConfiguration = {
                            repository: repoUrl,
                            fromReleases: false,
                            branch: localConfig.betaEnabled = localConfig.betaEnabled ? 'beta' : 'master',
                            tempLocation: './tmp/',
                            ignoreFiles: ['config.json']
                        }
    
                        // Creates a new instance of the updater
                        const updater = new AutoGitUpdate(updateConfiguration);
    
                        // Updates the bot
                        await updater.autoUpdate();

                        // Requires the child_process library
                        const { exec } = require('child_process');

                        // Function to install the dependencies
                        const installDependencies = () => {

                            // Returns a promise to install the dependencies
                            return new Promise((resolve, reject) => {

                                // Execites the command to install the dependencies
                                exec('npm install', (error, stdout, stderr) => {

                                    // If an error occurred
                                    if (error) {

                                        // Logs an error message if one occurred
                                        console.error(`Error while installing dependencies : ${error.stack}`);

                                        // Rejects the promise with the error
                                        reject(error);

                                    } else {
                                        
                                        // Resolves the promise
                                        resolve();
                                    };
                                });
                            });
                        };

                        // Installs the dependencies
                        await installDependencies();
                        
                        // Cleans the console and shows the logo
                        process.stdout.write('\u001b[2J\u001b[0;0H');
                        await splashLogo(client.locale.lib.loaders.splashLogo);

                        // Shows a message indicating that the bot has been updated
                        console.log(`🎉 ${await client.functions.utils.parseLocale(locale.updatedCorrectly, { targetVersion: `v${latestRemoteTag}` })}\n`);

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

                        // Elimina el directorio temporal
                        if (fs.existsSync(tmpDir)) await fs.promises.rmdir('./tmp');

                        // Logs an error message if one occurred
                        throw new Error(`An error occurred while updating the bot: ${error.stack}`);
                    };
                };

                // Shows a message indicating that there are new updates
                if (!forceUpdate) {

                    // Function to obtain the release notes from the GitHub repository
                    function getReleaseNotes(owner, repository, tagName) {

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

                                        // Parses the data
                                        const jsonData = JSON.parse(data);

                                        // Resolves the promise with the body of the response
                                        resolve(jsonData.body);

                                    } else {

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
                    console.log(`🆕 ${await client.functions.utils.parseLocale(locale.newVersionAvailable, { targetVersion: latestRemoteTag })}\n`);

                    // Uses a regular expression to obtain the owner and repository name from the URL
                    const repositoryMetadata = packageConfig.repository.url.match(/github\.com\/([^\/]+)\/([^\/]+)\.git/);
    
                    // Stores the owner and repository name
                    const repositoryOwner = repositoryMetadata[1];
                    const repositoryName = repositoryMetadata[2];
    
                    // Obtains the release notes
                    await getReleaseNotes(repositoryOwner, repositoryName, latestRemoteTag).then(releaseNotes => {

                        // Shows the release notes
                        console.log(`${locale.releaseNotes}:\n${releaseNotes}\n`);

                    }).catch(error => {

                        // Shows an error message if one occurred
                        console.log(`❌ ${locale.releaseNotesError}\n`);
    
                        // Logs an error message if one occurred
                        logger.error(error);
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
                };
    
            } else {

                // Cleans the console and shows the logo
                process.stdout.write('\u001b[2J\u001b[0;0H');
                await splashLogo(client.locale.lib.loaders.splashLogo);

                // Shows a message indicating that the bot is updated to the latest version
                console.log(`✅ ${locale.alreadyUpdated}: v${latestLocalTag}\n`);
            };

            // Shows the post-update check menu
            await showPostUpdateCheckMenu();

        } catch (error) {

            // Shows an error message if one occurred
            console.error("❌ An error ocurred during the update process:", error.stack);
        };

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[menuName](error);
    };
};
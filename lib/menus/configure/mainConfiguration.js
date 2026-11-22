// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { splashLogo, loadLocales, loadCommands } from 'helpbot/loaders';
import fs from 'fs';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (beforeError) => {

    try {

        // Function to get the current locale configuration
        function getLocale() {
            // Returns the submenu locale translations
            return client.locale.lib.menus[parentMenuName].submenus[menuName];
        };

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

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows an error message if one occurred
            if (beforeError) {

                // Prints the error message
                console.log(`❌ ${currentLocale.errorMessage}.\n`);

                // Logs the error if not in production
                if (process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

                // Clears the error so it doesn't persist
                beforeError = null;
            };

            // Shows a text explaining the module
            console.log(`🔧 ${currentLocale.headerMessage}.\n`);

            // Shows the select menu
            global.currentPrompt = select({
                message: `${currentLocale.promptMessage}:`,
                choices: [
                    {
                        name: `🌐 ${currentLocale.choices.language}`,
                        value: 'language'
                    },
                    {
                        name: `⚡ ${currentLocale.choices.pingMsTreshold}`,
                        value: 'pingMsTreshold'
                    },
                    {
                        name: `🛡️  ${currentLocale.choices.botManagers}`,
                        value: 'botManagers'
                    },
                    {
                        name: `🗄️  ${currentLocale.choices.records}`,
                        value: 'records'
                    },
                    {
                        name: `🎭 ${currentLocale.choices.presence}`,
                        value: 'presence'
                    },
                    {
                        name: `🚫 ${currentLocale.choices.ignoredCommands}`,
                        value: 'ignoredCommands'
                    },
                    {
                        name: `🎨 ${currentLocale.choices.colorPalette}`,
                        value: 'colorPalette'
                    },
                    {
                        name: `↩️  ${currentLocale.choices.return}`,
                        value: 'return'
                    }
                ],
            });

            // When the user selects an option
            global.currentPrompt.then(async (result) => {

                // Evaluates the selected option
                switch (result) {

                    // If the user wants to select a language
                    case 'language':

                        // Shows the language selection menu
                        await selectLanguageMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure ping threshold
                    case 'pingMsTreshold':

                        // Shows the ping threshold configuration menu
                        await setPingThresholdMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure bot managers
                    case 'botManagers':

                        // Shows the bot managers menu
                        await botManagersMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure records/logs
                    case 'records':

                        // Shows the logging records menu
                        await recordsMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure bot presence
                    case 'presence':

                        // Shows the presence configuration menu
                        await presenceMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure ignored commands
                    case 'ignoredCommands':

                        // Shows the ignored commands configuration menu
                        await ignoredCommandsMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure color palette
                    case 'colorPalette':

                        // Shows the color palette configuration menu
                        await colorPaletteMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to return to the main menu
                    case 'return':

                        // Shows the main configure menu
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

        // Submenu to select the bot language
        async function selectLanguageMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows the select language explanation header
            console.log(`🌐 ${currentLocale.prompts.selectLanguageHeader}.\n`);

            // If the language is set by the "LOCALE" environment variable, which takes precedence over the local configuration
            if (process.env.LOCALE && process.env.LOCALE.length > 0) {

                // Shows a message indicating that it can only be changed there
                console.log(`🔒 ${await client.functions.utils.parseLocale(currentLocale.prompts.languageSetByEnvironment, { locale: process.env.LOCALE })}.`);

                // Waits 4 seconds
                await new Promise(resolve => setTimeout(resolve, 4000));

                // Returns to the main configuration menu
                return await drawMenu();
            };

            // Shows the language selection list
            const selectedLanguage = await select({
                message: `${currentLocale.prompts.selectLanguage}:`,
                choices: [
                    { name: '🇺🇸 English (en-US)', value: 'en-US' },
                    { name: '🇪🇸 Español (es-ES)', value: 'es-ES' },
                    { name: '🇮🇹 Italiano (it)', value: 'it' },
                    { name: '🇷🇴 Română (ro)', value: 'ro' },
                    { name: '🇨🇳 简体中文 (zh-CN)', value: 'zh-CN' }
                ]
            });

            // Gets local configuration data
            const localConfig = client.localConfig;

            // Updates language in configuration
            localConfig.locale = selectedLanguage;

            // Writes updated configuration file
            await fs.promises.writeFile('./config.json', JSON.stringify(localConfig, null, 4));

            // Reloads locale translations in memory
            client.locale = await loadLocales(selectedLanguage);

            // Shows language success message
            console.log(`\n🟢 ${getLocale().prompts.languageSuccess}.`);

            // Waits 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Returns to the main configuration menu
            await drawMenu();
        };

        // Submenu to set the ping threshold
        async function setPingThresholdMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows the ping threshold explanation header
            console.log(`⚡ ${currentLocale.prompts.pingThresholdHeader}.\n`);

            // Gets current threshold from database
            const currentThreshold = await client.functions.db.getConfig('system.pingMsTreshold');

            // Prints current ping threshold
            console.log(`Current ping threshold: ${currentThreshold} ms\n`);

            // Prompts user to enter new threshold
            const thresholdInput = await input({
                message: `${currentLocale.prompts.enterPingThreshold}:`,
                validate: value => {
                    const val = value.trim();
                    if (val === '') return true;
                    const parsed = parseInt(value, 10);
                    if (isNaN(parsed) || parsed <= 0) return 'Please enter a positive integer.';
                    return true;
                }
            });

            // Trims whitespace from input
            const val = thresholdInput.trim();

            // If input is empty
            if (val === '') {

                // Returns to main configuration menu
                await drawMenu();

                // Returns to break execution
                return;
            };

            // Parses threshold to integer
            const parsedVal = parseInt(thresholdInput, 10);

            // Updates ping threshold in database
            await client.functions.db.setConfig('system.pingMsTreshold', parsedVal);

            // Shows threshold success message
            console.log(`\n🟢 ${getLocale().prompts.pingSuccess.replace('{{threshold}}', parsedVal)}.`);

            // Waits 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Returns to main configuration menu
            await drawMenu();
        };

        // Submenu to manage bot managers
        async function botManagersMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows the bot managers explanation header
            console.log(`🛡️  ${currentLocale.prompts.botManagersHeader}.\n`);

            // Gets current managers list from database
            const currentManagers = await client.functions.db.getConfig('system.botManagers') || [];

            // Shows current managers title
            console.log(`🛡️  ${currentLocale.prompts.currentBotManagersTitle}:`);

            // If no managers are configured
            if (currentManagers.length === 0) {

                // Prints no managers configured message
                console.log(`   ${currentLocale.prompts.noManagersConfigured}.`);

            // If there are configured managers
            } else {

                // Loops through each manager ID
                for (const id of currentManagers) {

                    // Attempts to get role from cache
                    const role = client.baseGuild.roles.cache.get(id);

                    // If it is a role
                    if (role) {

                        // Prints the role details
                        console.log(`   - [Role] ${role.name} (${id})`);

                        // Continues the loop
                        continue;
                    };

                    // Attempts to get member from cache
                    let member = client.baseGuild.members.cache.get(id);

                    // If member not found in cache
                    if (!member) {

                        // Try to fetch member from guild
                        try {

                            // Fetches member by ID
                            member = await client.baseGuild.members.fetch(id);

                        // In case of error
                        } catch (err) {
                            // ignore
                        }
                    };

                    // If member was fetched successfully
                    if (member) {

                        // Prints the member details
                        console.log(`   - [User] ${member.user.username}${member.nickname ? ` (${member.nickname})` : ''} (${id})`);

                    // If neither role nor member could be resolved
                    } else {

                        // Prints unknown manager details
                        console.log(`   - [Unknown] ${id}`);
                    };
                };
            };

            // Prints blank line
            console.log();

            // Shows bot manager options select prompt
            const action = await select({
                message: `${currentLocale.prompts.managersAction}:`,
                choices: [
                    { name: `➕ ${currentLocale.prompts.addManager}`, value: 'add' },
                    { name: `➖ ${currentLocale.prompts.removeManager}`, value: 'remove' },
                    { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
                ]
            });

            // If user wants to return
            if (action === 'return') {

                // Returns to main configuration menu
                await drawMenu();

                // Returns to break execution
                return;
            };

            // If user wants to add a manager
            if (action === 'add') {

                // Shows search method select prompt
                const searchMethod = await select({
                    message: `${currentLocale.prompts.searchMethod}:`,
                    choices: [
                        { name: currentLocale.prompts.searchByName, value: 'name' },
                        { name: currentLocale.prompts.searchRoleByName, value: 'role' },
                        { name: currentLocale.prompts.enterId, value: 'id' }
                    ]
                });

                // Stores the selected ID to add
                let selectedMemberId = null;

                // If search method is by user name
                if (searchMethod === 'name') {

                    // Prompts for query string
                    const query = await input({
                        message: `${currentLocale.prompts.searchNamePrompt}:`
                    });

                    // Filters cached members by name query
                    let filtered = client.baseGuild.members.cache.filter(m =>
                        (m.user.username && m.user.username.toLowerCase().includes(query.toLowerCase())) ||
                        (m.nickname && m.nickname.toLowerCase().includes(query.toLowerCase()))
                    );

                    // If not found in cache
                    if (filtered.size === 0) {

                        // Try to fetch members by query
                        try {

                            // Fetches members from guild API
                            const fetched = await client.baseGuild.members.fetch({ query: query, limit: 25 });

                            // Updates filtered list
                            filtered = fetched;

                        // In case of error
                        } catch (err) {
                            // ignore
                        }
                    };

                    // If no members were found
                    if (!filtered || filtered.size === 0) {

                        // Prints no members found message
                        console.log(`\n❌ ${currentLocale.prompts.noMembersFound}.`);

                        // Waits 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Runs bot managers menu again
                        await botManagersMenu();

                        // Returns to break execution
                        return;
                    };

                    // Maps members to choice options
                    const memberChoices = filtered.map(m => ({
                        name: `${m.user.username}${m.nickname ? ` (${m.nickname})` : ''} - ${m.id}`,
                        value: m.id
                    })).slice(0, 25);

                    // Pushes return choice option to list
                    memberChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

                    // Shows select menu to choose member
                    selectedMemberId = await select({
                        message: `${currentLocale.prompts.selectMemberPrompt}:`,
                        choices: memberChoices
                    });

                    // If user wants to return
                    if (selectedMemberId === 'return') {

                        // Runs bot managers menu again
                        await botManagersMenu();

                        // Returns to break execution
                        return;
                    };

                // If search method is by role name
                } else if (searchMethod === 'role') {

                    // Prompts for role query
                    const query = await input({
                        message: `${currentLocale.prompts.searchRolePrompt}:`
                    });

                    // Filters cached roles by name query
                    let roles = client.baseGuild.roles.cache.filter(r =>
                        r.name.toLowerCase().includes(query.toLowerCase())
                    );

                    // If not found in cache
                    if (roles.size === 0) {

                        // Try to fetch all guild roles
                        try {

                            // Fetches all roles from guild API
                            const fetchedRoles = await client.baseGuild.roles.fetch();

                            // Filters fetched roles by query
                            roles = fetchedRoles.filter(r =>
                                r.name.toLowerCase().includes(query.toLowerCase())
                            );

                        // In case of error
                        } catch (err) {
                            // ignore
                        }
                    };

                    // If no roles were found
                    if (!roles || roles.size === 0) {

                        // Prints no roles found message
                        console.log(`\n❌ ${currentLocale.prompts.noRolesFound}.`);

                        // Waits 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Runs bot managers menu again
                        await botManagersMenu();

                        // Returns to break execution
                        return;
                    };

                    // Maps roles to choices options
                    const roleChoices = roles.map(r => ({
                        name: `👥 ${r.name} - ${r.id}`,
                        value: r.id
                    })).slice(0, 25);

                    // Pushes return choice option to list
                    roleChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

                    // Shows select menu to choose role
                    selectedMemberId = await select({
                        message: `${currentLocale.prompts.selectRolePrompt}:`,
                        choices: roleChoices
                    });

                    // If user wants to return
                    if (selectedMemberId === 'return') {

                        // Runs bot managers menu again
                        await botManagersMenu();

                        // Returns to break execution
                        return;
                    };

                // If search method is by ID
                } else {

                    // Prompts user to enter ID
                    const inputId = await input({
                        message: `${currentLocale.prompts.enterIdPrompt}:`,
                        validate: v => v.trim().length > 0 ? true : 'ID cannot be empty'
                    });

                    // Checks if role ID exists in cache
                    let exists = client.baseGuild.roles.cache.has(inputId);

                    // If role ID not in cache
                    if (!exists) {

                        // Try to fetch role from API
                        try {

                            // Fetches role by ID
                            const fetchedRole = await client.baseGuild.roles.fetch(inputId);

                            // If fetched role exists, sets exists to true
                            if (fetchedRole) exists = true;

                        // In case of error
                        } catch (err) {
                            // ignore
                        }
                    };

                    // If not a role, check member
                    if (!exists) {

                        // Fetches member by ID
                        const member = await client.functions.utils.fetch('member', inputId);

                        // If fetched member exists, sets exists to true
                        if (member) exists = true;
                    };

                    // If neither role nor member exists
                    if (!exists) {

                        // Prints error message
                        console.log(`\n❌ ${currentLocale.prompts.noUsersOrRolesFound}.`);

                        // Waits 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        // Runs bot managers menu again
                        await botManagersMenu();

                        // Returns to break execution
                        return;
                    };

                    // Sets selected manager ID to input
                    selectedMemberId = inputId;
                };

                // Gets current managers list
                const currentManagers = await client.functions.db.getConfig('system.botManagers') || [];

                // If already configured as manager
                if (currentManagers.includes(selectedMemberId)) {

                    // Prints warning message
                    console.log(`\n⚠️  ${currentLocale.prompts.alreadyManager}`);

                // If not configured as manager
                } else {

                    // Pushes selected ID to managers list
                    currentManagers.push(selectedMemberId);

                    // Updates managers list in database
                    await client.functions.db.setConfig('system.botManagers', currentManagers);

                    // Prints success message
                    console.log(`\n🟢 ${currentLocale.prompts.managerAdded}`);
                };

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs bot managers menu again
                await botManagersMenu();

            // If user wants to remove a manager
            } else if (action === 'remove') {

                // Gets current managers list
                const currentManagers = await client.functions.db.getConfig('system.botManagers') || [];

                // If no managers are configured
                if (currentManagers.length === 0) {

                    // Prints error message
                    console.log(`\n❌ ${currentLocale.prompts.noManagersConfigured}.`);

                    // Waits 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Runs bot managers menu again
                    await botManagersMenu();

                    // Returns to break execution
                    return;
                };

                // Stores the manager choice list
                const managerChoices = [];

                // Loops through configured managers
                for (const managerId of currentManagers) {

                    // Checks if manager ID is role
                    const role = client.baseGuild.roles.cache.get(managerId);

                    // If manager ID is role
                    if (role) {

                        // Pushes role option to choices
                        managerChoices.push({
                            name: `👥 [Role] ${role.name} - ${managerId}`,
                            value: managerId
                        });

                        // Continues loop
                        continue;
                    };

                    // Gets member from cache
                    let member = client.baseGuild.members.cache.get(managerId);

                    // If not in cache
                    if (!member) {

                        // Try to fetch member from API
                        try {

                            // Fetches member by ID
                            member = await client.baseGuild.members.fetch(managerId);

                        // In case of error
                        } catch (err) {
                            // ignore
                        }
                    };

                    // Sets display name based on resolved member or unknown
                    const displayName = member ? `👤 [User] ${member.user.username}${member.nickname ? ` (${member.nickname})` : ''}` : `❓ [Unknown] ${managerId}`;

                    // Pushes user option to choices list
                    managerChoices.push({
                        name: `${displayName} - ${managerId}`,
                        value: managerId
                    });
                };

                // Pushes return choice option to choices list
                managerChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

                // Shows select menu to choose manager to remove
                const selectedManagerId = await select({
                    message: `${currentLocale.prompts.selectManagerToRemove}:`,
                    choices: managerChoices
                });

                // If a manager is selected for removal
                if (selectedManagerId !== 'return') {

                    // Filters out selected manager
                    const updated = currentManagers.filter(id => id !== selectedManagerId);

                    // Updates managers list in database
                    await client.functions.db.setConfig('system.botManagers', updated);

                    // Prints success message
                    console.log(`\n🟢 ${currentLocale.prompts.managerRemoved}`);

                    // Waits 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));
                };

                // Runs bot managers menu again
                await botManagersMenu();
            };
        };

        // Function to choose a text channel of the guild, that returns its ID (or null if no channel was chosen)
        async function selectTextChannel(currentLocale) {

            // Shows search channel method select menu
            const searchMethod = await select({
                message: `${currentLocale.prompts.searchMethod}:`,
                choices: [
                    { name: currentLocale.prompts.searchChannelByName, value: 'name' },
                    { name: currentLocale.prompts.enterChannelId, value: 'id' }
                ]
            });

            // If search method is by channel name
            if (searchMethod === 'name') {

                // Prompts user for channel name query
                const query = await input({
                    message: `${currentLocale.prompts.searchChannelPrompt}:`
                });

                // Fetches guild channels
                const channels = await client.baseGuild.channels.fetch();

                // Filters channels by name query
                const filtered = channels.filter(c =>
                    c.type === discord.ChannelType.GuildText &&
                    c.name.toLowerCase().includes(query.toLowerCase())
                );

                // If no channels were found
                if (filtered.size === 0) {

                    // Prints error message
                    console.log(`\n❌ ${currentLocale.prompts.noChannelsFound}.`);

                    // Waits 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Returns that no channel was chosen
                    return null;
                };

                // Maps filtered channels to select choice options
                const channelChoices = filtered.map(c => ({
                    name: `#${c.name} - ${c.id}`,
                    value: c.id
                })).slice(0, 25);

                // Pushes return choice option to list
                channelChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

                // Shows select menu to choose channel
                const selectedChanId = await select({
                    message: `${currentLocale.prompts.selectChannelPrompt}:`,
                    choices: channelChoices
                });

                // Returns the chosen channel, or that no channel was chosen
                return selectedChanId === 'return' ? null : selectedChanId;
            };

            // Prompts user for channel ID
            const chanId = await input({
                message: `${currentLocale.prompts.enterChannelIdPrompt}:`,
                validate: v => v.trim().length > 0 ? true : 'ID cannot be empty'
            });

            // Fetches channel by ID
            const chan = await client.functions.utils.fetch('channel', chanId.trim());

            // If channel is invalid or not text
            if (!chan || chan.type !== discord.ChannelType.GuildText) {

                // Prints error message
                console.log(`\n❌ ${currentLocale.prompts.noChannelsFound}.`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Returns that no channel was chosen
                return null;
            };

            // Returns the chosen channel
            return chan.id;
        };

        // Function to get the text that shows a channel (its name, or its ID if it could not be found)
        async function getChannelText(channelId) {

            // Fetches the channel
            const chan = await client.functions.utils.fetch('channel', channelId);

            // Returns the name of the channel, or its ID
            return chan ? `#${chan.name}` : `ID: ${channelId}`;
        };

        // Stores the list of logging events
        const loggingEvents = [
            'warnedMember', 'warnRemoved', 'timeoutedMember', 'untimeoutedMember', 'kickedMember', 'kickedBot', 'bannedMember', 'bannedBot', 'unbannedMember', 'sentDM',
            'pollStarted', 'pollEnded', 'purgedChannel', 'slowmodeChanged', 'experienceModified', 'memberJoined', 'botJoined', 'memberLeaved', 'voiceMoves', 'memberReports'
        ];

        // Submenu to configure log event records
        async function recordsMenu() {

            // Loop guard variable to stay in records menu
            let stayInRecords = true;

            // Loops while user does not return
            while (stayInRecords) {

                // Clears the console
                await clearConsole();

                // Gets the current locale translations
                const currentLocale = getLocale();

                // Shows the records explanation header
                console.log(`🗄️  ${currentLocale.prompts.recordsHeader}.\n`);

                // Gets the default channel of the records
                const defaultChannelId = await client.functions.db.getConfig('logging.defaultChannelId');

                // Stores the choices for the select menu, starting with the default channel
                const choices = [{
                    name: `📌 ${currentLocale.prompts.defaultChannel}: ${defaultChannelId ? await getChannelText(defaultChannelId) : currentLocale.prompts.noChannel}`,
                    value: 'defaultChannel'
                }];

                // Loops through each logging event
                for (const ev of loggingEvents) {

                    // Gets config for logging event
                    const config = await client.functions.db.getConfig(`logging.${ev}`) || { enabled: false, channelId: '' };

                    // Gets status indicator icon
                    const statusText = config.enabled ? '🟢' : '🔴';

                    // Stores the display channel name (its own channel, the default one, or none if it is enabled without channel)
                    let channelName = '';
                    if (config.channelId) channelName = ` (${await getChannelText(config.channelId)})`;
                    else if (defaultChannelId) channelName = ` (${currentLocale.prompts.byDefault})`;
                    else if (config.enabled) channelName = ` (${currentLocale.prompts.noChannel})`;

                    // Pushes logging event choice to choices list
                    choices.push({
                        name: `${statusText} ${currentLocale.records[ev]}${channelName}`,
                        value: ev
                    });
                };

                // Pushes return choice option to choices list
                choices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

                // Shows select menu to choose record event
                const recordEvent = await select({
                    message: `${currentLocale.prompts.selectRecord}:`,
                    choices: choices
                });

                // If user wants to return
                if (recordEvent === 'return') {

                    // Sets stay guard variable to false
                    stayInRecords = false;

                    // Returns to main configuration menu
                    await drawMenu();

                    // Returns to break loop
                    return;
                };

                // Runs the menu of the default channel, or the config menu for selected record event
                if (recordEvent === 'defaultChannel') await defaultChannelMenu();
                else await recordEventConfigMenu(recordEvent);
            };
        };

        // Submenu to configure the default channel of the records
        async function defaultChannelMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows the default channel explanation header
            console.log(`📌 ${currentLocale.prompts.defaultChannelHeader}.\n`);

            // Gets the default channel of the records
            const defaultChannelId = await client.functions.db.getConfig('logging.defaultChannelId');

            // Stores the action options, offering to clear the channel only if there is one
            const actionChoices = [{ name: `📝 ${currentLocale.prompts.changeChannel}`, value: 'channel' }];
            if (defaultChannelId) actionChoices.push({ name: `🧹 ${currentLocale.prompts.clearDefaultChannel}`, value: 'clear' });
            actionChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

            // Shows action options select menu
            const action = await select({
                message: `${currentLocale.prompts.defaultChannel}: ${defaultChannelId ? await getChannelText(defaultChannelId) : currentLocale.prompts.noChannel}`,
                choices: actionChoices
            });

            // If user wants to change the default channel
            if (action === 'channel') {

                // Asks for the channel
                const selectedChanId = await selectTextChannel(currentLocale);

                // If a channel was chosen
                if (selectedChanId) {

                    // Updates the default channel
                    await client.functions.db.setConfig('logging.defaultChannelId', selectedChanId);

                    // Prints success message
                    console.log(`\n🟢 ${currentLocale.prompts.channelSuccess}`);

                    // Waits 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));
                };

            // If user wants to clear the default channel
            } else if (action === 'clear') {

                // Clears the default channel
                await client.functions.db.setConfig('logging.defaultChannelId', '');

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.defaultChannelCleared}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));
            };
        };

        // Submenu to configure a specific record event
        async function recordEventConfigMenu(recordEvent) {

            // Loop guard variable to stay in event submenu
            let stayInSubmenu = true;

            // Loops while configuring the selected event
            while (stayInSubmenu) {

                // Clears the console
                await clearConsole();

                // Gets the current locale translations
                const currentLocale = getLocale();

                // Gets current event configuration and the default channel
                const currentConfig = await client.functions.db.getConfig(`logging.${recordEvent}`) || { enabled: false, channelId: '' };
                const defaultChannelId = await client.functions.db.getConfig('logging.defaultChannelId');

                // Stores the text of the channel used by the record (its own channel, the default one, or none)
                let channelText = currentLocale.prompts.noChannel;
                if (currentConfig.channelId) channelText = await getChannelText(currentConfig.channelId);
                else if (defaultChannelId) channelText = `${await getChannelText(defaultChannelId)} (${currentLocale.prompts.byDefault})`;

                // Shows the record, its status and its channel
                console.log(`🗄️  ${currentLocale.records[recordEvent]}: ${currentConfig.enabled ? `🟢 ${client.locale.status.enabled}` : `🔴 ${client.locale.status.disabled}`} · ${channelText}\n`);

                // Stores the action options, offering to use the default channel only if the record has its own channel
                const actionChoices = [
                    {
                        name: currentConfig.enabled
                            ? `🔴 ${currentLocale.prompts.disableRecord}`
                            : `🟢 ${currentLocale.prompts.enableRecord}`,
                        value: 'toggle'
                    },
                    { name: `📝 ${currentLocale.prompts.changeChannel}`, value: 'channel' }
                ];
                if (currentConfig.channelId) actionChoices.push({ name: `📌 ${currentLocale.prompts.useDefaultChannel}`, value: 'useDefault' });
                actionChoices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

                // Shows action options select menu
                const recordAction = await select({
                    message: `${currentLocale.prompts.recordAction}:`,
                    choices: actionChoices
                });

                // If user wants to return
                if (recordAction === 'return') {

                    // Sets submenu guard variable to false
                    stayInSubmenu = false;

                    // Returns to break loop
                    return;
                };

                // If user wants to enable/disable record
                if (recordAction === 'toggle') {

                    // If enabling but neither its own channel nor a default channel are configured
                    if (!currentConfig.enabled && !currentConfig.channelId && !defaultChannelId) {

                        // Shows error message to user
                        console.log(`\n❌ ${currentLocale.prompts.noChannelConfiguredError}.`);

                        // Waits 3 seconds
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // Continues the loop
                        continue;
                    };

                    // Toggles enabled status of logging event
                    await client.functions.db.setConfig(`logging.${recordEvent}.enabled`, !currentConfig.enabled);

                // If user wants to change target channel
                } else if (recordAction === 'channel') {

                    // Asks for the channel
                    const selectedChanId = await selectTextChannel(currentLocale);

                    // If a channel was chosen
                    if (selectedChanId) {

                        // Updates logging event target channel
                        await client.functions.db.setConfig(`logging.${recordEvent}.channelId`, selectedChanId);

                        // Prints success message
                        console.log(`\n🟢 ${currentLocale.prompts.channelSuccess}`);

                        // Waits 2 seconds
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    };

                // If user wants the record to use the default channel
                } else if (recordAction === 'useDefault') {

                    // Clears the channel of the record, so it uses the default one
                    await client.functions.db.setConfig(`logging.${recordEvent}.channelId`, '');

                    // Prints success message
                    console.log(`\n🟢 ${currentLocale.prompts.useDefaultChannelSuccess}`);

                    // Waits 2 seconds
                    await new Promise(resolve => setTimeout(resolve, 2000));
                };
            };
        };

        // Submenu to configure bot presence status
        async function presenceMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows presence explanation header
            console.log(`🎭 ${currentLocale.prompts.presenceHeader}.\n`);

            // Shows presence actions select menu
            const presenceAction = await select({
                message: `${currentLocale.prompts.presenceAction}:`,
                choices: [
                    { name: currentLocale.prompts.changePresenceText, value: 'text' },
                    { name: currentLocale.prompts.toggleMembersCount, value: 'membersCount' },
                    { name: currentLocale.prompts.changePresenceStatus, value: 'status' },
                    { name: currentLocale.prompts.changePresenceType, value: 'type' },
                    { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
                ]
            });

            // If user wants to return
            if (presenceAction === 'return') {

                // Returns to main configuration menu
                await drawMenu();

                // Returns to break execution
                return;
            };

            // If user wants to change presence text
            if (presenceAction === 'text') {

                // Prompts user for presence text
                const text = await input({
                    message: `${currentLocale.prompts.enterPresenceText}:`
                });

                // Updates presence text in database
                await client.functions.db.setConfig('presence.showText', text);

                // Triggers bot presence updates
                await client.functions.managers.updatePresence();

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs presence configuration menu again
                await presenceMenu();

            // If user wants to toggle member count presence
            } else if (presenceAction === 'membersCount') {

                // Gets current member count presence status
                const current = await client.functions.db.getConfig('presence.membersCount');

                // Toggles member count presence in database
                await client.functions.db.setConfig('presence.membersCount', !current);

                // Triggers bot presence updates
                await client.functions.managers.updatePresence();

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs presence configuration menu again
                await presenceMenu();

            // If user wants to change presence online status
            } else if (presenceAction === 'status') {

                // Shows status selection menu
                const newStatus = await select({
                    message: `${currentLocale.prompts.changePresenceStatus}:`,
                    choices: [
                        { name: '🟢 Online', value: 'online' },
                        { name: '🌙 Idle', value: 'idle' },
                        { name: '🔴 Do Not Disturb', value: 'dnd' },
                        { name: '⚫ Offline', value: 'offline' }
                    ]
                });

                // Updates presence status in database
                await client.functions.db.setConfig('presence.status', newStatus);

                // Triggers bot presence updates
                await client.functions.managers.updatePresence();

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs presence configuration menu again
                await presenceMenu();

            // If user wants to change presence activity type
            } else if (presenceAction === 'type') {

                // Shows activity type selection menu
                const newType = await select({
                    message: `${currentLocale.prompts.changePresenceType}:`,
                    choices: [
                        { name: 'Playing', value: 'PLAYING' },
                        { name: 'Streaming', value: 'STREAMING' },
                        { name: 'Listening', value: 'LISTENING' },
                        { name: 'Watching', value: 'WATCHING' },
                        { name: 'Custom', value: 'CUSTOM' },
                        { name: 'Competing', value: 'COMPETING' }
                    ]
                });

                // Updates presence activity type in database
                await client.functions.db.setConfig('presence.type', newType);

                // Triggers bot presence updates
                await client.functions.managers.updatePresence();

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.presenceSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Runs presence configuration menu again
                await presenceMenu();
            };
        };

        // Submenu to configure ignored commands
        async function ignoredCommandsMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows ignored commands explanation header
            console.log(`🚫 ${currentLocale.prompts.ignoredCommandsHeader}.\n`);

            // Shows select menu to choose command type
            const cmdType = await select({
                message: `${currentLocale.prompts.ignoredCommandsAction}:`,
                choices: [
                    { name: '🗨️  Chat Commands', value: 'chatCommands' },
                    { name: '✉️  Message Commands', value: 'messageCommands' },
                    { name: '👤 User Commands', value: 'userCommands' },
                    { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
                ]
            });

            // If user wants to return
            if (cmdType === 'return') {

                // Returns to main configuration menu
                await drawMenu();

                // Returns to break execution
                return;
            };

            // Gets list of currently ignored commands
            const ignored = await client.functions.db.getConfig(`commands.ignored.${cmdType}`) || [];

            // Reads files from commands directory
            const localCommands = fs.readdirSync(`./handlers/commands/${cmdType}/`);

            // Maps files to choose choices list
            const choices = localCommands.map(cmdFile => {

                // Gets locale definitions for the command file
                const loc = client.locale.handlers.commands[cmdType][cmdFile];

                // Sets the name to display
                const name = loc ? loc.appData.name : cmdFile;

                // Checks if command is ignored
                const isIgnored = ignored.includes(name);

                // Returns choice option representation
                return {
                    name: `${name} [${isIgnored ? '🔴 Ignored' : '🟢 Active'}]`,
                    value: name
                };
            });

            // Pushes return choice option to list
            choices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

            // Shows select menu to toggle command ignore status
            const selectedCmd = await select({
                message: `${currentLocale.prompts.toggleIgnoredPrompt}:`,
                choices: choices
            });

            // If a command is selected
            if (selectedCmd !== 'return') {

                // Stores the updated ignored list
                let updated;

                // If command was already ignored
                if (ignored.includes(selectedCmd)) {

                    // Removes command from ignored list
                    updated = ignored.filter(x => x !== selectedCmd);

                // If command was not ignored
                } else {

                    // Adds command to ignored list
                    updated = [...ignored, selectedCmd];
                };

                // Updates ignored commands in database
                await client.functions.db.setConfig(`commands.ignored.${cmdType}`, updated);

                // Reloads commands in memory
                await loadCommands();

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.ignoredSuccess}`);

                // Waits 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));
            };

            // Runs ignored commands menu again
            await ignoredCommandsMenu();
        };

        // Submenu to configure color palette
        async function colorPaletteMenu() {

            // Clears the console
            await clearConsole();

            // Gets the current locale translations
            const currentLocale = getLocale();

            // Shows color palette explanation header
            console.log(`🎨 ${currentLocale.prompts.colorPaletteHeader}.\n`);

            // List of color keys to configure
            const colorKeys = ['primary', 'error', 'secondaryError', 'correct', 'secondaryCorrect', 'warning', 'information', 'logging', 'polls'];

            // Stores select options for color palette keys
            const choices = [];

            // Loops through each color key
            for (const key of colorKeys) {

                // Gets current color hex value
                const val = await client.functions.db.getConfig(`colors.${key}`) || 'FFFFFF';

                // Pushes color choice to choice list
                choices.push({ name: `${key} [#${val}]`, value: key });
            };

            // Pushes return choice option to list
            choices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

            // Shows select menu to choose color key
            const selectedRole = await select({
                message: `${currentLocale.prompts.selectColor}:`,
                choices: choices
            });

            // If user wants to return
            if (selectedRole === 'return') {

                // Returns to main configuration menu
                await drawMenu();

                // Returns to break execution
                return;
            };

            // Predefined list of preset colors
            const presetColors = [
                { name: '🔴 Red (#FF0000)', value: 'FF0000' },
                { name: '🟠 Orange (#FFA500)', value: 'FFA500' },
                { name: '🟡 Yellow (#FFFF00)', value: 'FFFF00' },
                { name: '🟢 Green (#008000)', value: '008000' },
                { name: '🔵 Blue (#0000FF)', value: '0000FF' },
                { name: '🟣 Purple (#800080)', value: '800080' },
                { name: '🌸 Pink (#FFC0CB)', value: 'FFC0CB' },
                { name: '⚪ White (#FFFFFF)', value: 'FFFFFF' },
                { name: '⚫ Black (#000000)', value: '000000' },
                { name: currentLocale.prompts.customHexOption, value: 'custom' },
                { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }
            ];

            // Shows select menu to choose color value
            const selectedVal = await select({
                message: `${currentLocale.prompts.selectPredefinedColor}:`,
                choices: presetColors
            });

            // If user wants to return
            if (selectedVal === 'return') {

                // Runs color palette menu again
                await colorPaletteMenu();

                // Returns to break execution
                return;
            };

            // If user wants to configure custom hex color
            if (selectedVal === 'custom') {

                // Prompts user to enter custom hex
                const hexInput = await input({
                    message: `${currentLocale.prompts.enterHex}:`,
                    validate: v => {
                        const hexRegex = /^[0-9A-Fa-f]{6}$/;
                        if (!hexRegex.test(v)) return 'Please enter a valid 6-character hex color code (without #).';
                        return true;
                    }
                });

                // Updates configured color in database
                await client.functions.db.setConfig(`colors.${selectedRole}`, hexInput.toUpperCase());

            // If user chose a predefined color
            } else {

                // Updates configured color in database
                await client.functions.db.setConfig(`colors.${selectedRole}`, selectedVal);
            };

            // Prints success message
            console.log(`\n🟢 ${currentLocale.prompts.colorSuccess}`);

            // Waits 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Runs color palette menu again
            await colorPaletteMenu();
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

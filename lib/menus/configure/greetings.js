// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (beforeError) => {

    try {

        // Stores the translations of the bot
        const locale = client.locale.lib.menus[parentMenuName].submenus[menuName];

        // Function to clear the console
        async function clearConsole() {
            // Cleans the console and shows the logo
            process.stdout.write('\u001b[2J\u001b[0;0H');
            await splashLogo(client.locale.lib.loaders.splashLogo);
        };

        // Function to wait some seconds, so the user can read a message
        async function wait(seconds) {
            await new Promise(resolve => setTimeout(resolve, seconds * 1000));
        };

        // Function to get the text that shows a role (its name, its ID if it could not be found, or none)
        async function getRoleText(roleId) {

            // Returns none if there is no role
            if (!roleId) return locale.none;

            // Fetches the role from the guild cache or Discord API
            const role = client.baseGuild.roles.cache.get(roleId) || await client.baseGuild.roles.fetch(roleId).catch(() => null);

            // Returns the name of the role, or its ID
            return role ? `@${role.name}` : `ID: ${roleId}`;
        };

        // Function to get the text that shows a channel (its name, its ID if it could not be found, or none)
        async function getChannelText(channelId) {

            // Returns none if there is no channel
            if (!channelId) return locale.none;

            // Fetches the channel
            const channel = await client.functions.utils.fetch('channel', channelId);

            // Returns the name of the channel, or its ID
            return channel ? `#${channel.name}` : `ID: ${channelId}`;
        };

        // Function to get the text that shows a status
        function getStatusText(enabled) {
            return enabled ? `🟢 ${client.locale.status.enabled}` : `🔴 ${client.locale.status.disabled}`;
        };

        // Function to draw the menu
        async function drawMenu() {

            // Clears the console
            await clearConsole();

            // Shows an error message if one occurred
            if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
            if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);

            // Gets the current settings
            const isModuleEnabled = await client.functions.db.getConfig('system.modules.greetings');
            const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');
            const newMemberRoleId = await client.functions.db.getConfig('welcomes.newMemberRoleId');
            const newBotRoleId = await client.functions.db.getConfig('welcomes.newBotRoleId');
            const publicWelcome = await client.functions.db.getConfig('welcomes.publicWelcome');
            const privateWelcome = await client.functions.db.getConfig('welcomes.privateWelcome');

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
                        name: `🕒 ${locale.choices.newMemberMode}: ${newMemberMode === 1 ? locale.modes.afterScreening : locale.modes.onJoin}`,
                        value: 'newMemberMode'
                    },
                    {
                        name: `👤 ${locale.choices.newMemberRole}: ${await getRoleText(newMemberRoleId)}`,
                        value: 'newMemberRole'
                    },
                    {
                        name: `🤖 ${locale.choices.newBotRole}: ${await getRoleText(newBotRoleId)}`,
                        value: 'newBotRole'
                    },
                    {
                        name: `📢 ${locale.choices.publicWelcome}: ${getStatusText(publicWelcome.enabled)}`,
                        value: 'publicWelcome'
                    },
                    {
                        name: `✉️  ${locale.choices.privateWelcome}: ${getStatusText(privateWelcome.enabled)}`,
                        value: 'privateWelcome'
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
                        await client.functions.db.setConfig('system.modules.greetings', !isModuleEnabled);

                        // Redraws the menu
                        await drawMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to change the moment of the welcome
                    case 'newMemberMode':

                        // Shows the selection for the moment of the welcome
                        const newMode = await select({
                            message: `${locale.prompts.selectMode}:`,
                            choices: [
                                { name: locale.modes.onJoin, value: 0 },
                                { name: locale.modes.afterScreening, value: 1 }
                            ]
                        });

                        // Updates the moment of the welcome
                        await client.functions.db.setConfig('welcomes.newMemberMode', newMode);

                        // Redraws the menu
                        await drawMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to set the role for new members or new bots
                    case 'newMemberRole':
                    case 'newBotRole':

                        // Shows the role menu
                        await roleMenu(result === 'newBotRole' ? 'welcomes.newBotRoleId' : 'welcomes.newMemberRoleId');

                        // Redraws the menu
                        await drawMenu();

                        // Breaks the switch
                        break;

                    // If the user wants to configure the public or private welcome
                    case 'publicWelcome':
                    case 'privateWelcome':

                        // Shows the welcome menu
                        await welcomeMenu(result === 'publicWelcome' ? 'public' : 'private');

                        // Redraws the menu
                        await drawMenu();

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

        // Submenu to set the role for new members or new bots
        async function roleMenu(configPath) {

            // Shows search method selection prompt
            const searchMethod = await select({
                message: `${locale.prompts.selectSearchMethod}:`,
                choices: [
                    { name: locale.prompts.searchByName, value: 'name' },
                    { name: locale.prompts.enterId, value: 'id' },
                    { name: locale.prompts.clearRole, value: 'clear' },
                    { name: `↩️  ${locale.choices.return}`, value: 'return' }
                ]
            });

            // If the user wants to return, aborts
            if (searchMethod === 'return') return;

            // If the user wants to clear the configured role
            if (searchMethod === 'clear') {

                // Resets database config value to empty
                await client.functions.db.setConfig(configPath, '');

                // Shows success prompt to user
                console.log(`\n🟢 ${locale.prompts.clearRoleSuccess}`);

                // Waits 2 seconds
                return await wait(2);
            };

            // Stores the selected role ID
            let selectedRoleId = null;

            // If search method is by name
            if (searchMethod === 'name') {

                // Prompts for query text
                const query = await input({
                    message: `${locale.prompts.enterRoleNameSearch}:`
                });

                // Fetches all roles in the guild
                const roles = await client.baseGuild.roles.fetch();

                // Filters roles by query
                const filtered = roles.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

                // If no roles matched the query
                if (filtered.size === 0) {

                    // Shows error message to user
                    console.log(`\n🔴 ${locale.prompts.noRolesFound}.`);

                    // Waits 2 seconds
                    return await wait(2);
                };

                // Maps filtered roles to choice options
                const roleChoices = filtered.map(r => ({
                    name: `@${r.name} - ${r.id}`,
                    value: r.id
                })).slice(0, 25);

                // Pushes return choice option to choice list
                roleChoices.push({ name: `↩️  ${locale.choices.return}`, value: 'return' });

                // Shows select menu to choose the role
                selectedRoleId = await select({
                    message: `${locale.prompts.selectRole}:`,
                    choices: roleChoices
                });

                // If the user wants to return, aborts
                if (selectedRoleId === 'return') return;

            // If search method is manually entering role ID
            } else {

                // Prompts for the role ID string input
                const roleId = (await input({
                    message: `${locale.prompts.enterRoleId}:`,
                    validate: v => v.trim().length > 0 ? true : locale.prompts.emptyValue
                })).trim();

                // Fetches the role by ID from the guild cache or the API
                const role = client.baseGuild.roles.cache.get(roleId) || await client.baseGuild.roles.fetch(roleId).catch(() => null);

                // If the role doesn't exist
                if (!role) {

                    // Shows error message to user
                    console.log(`\n🔴 ${locale.prompts.roleNotFound}.`);

                    // Waits 2 seconds
                    return await wait(2);
                };

                // Sets selected role ID
                selectedRoleId = role.id;
            };

            // Updates the configured role in database
            await client.functions.db.setConfig(configPath, selectedRoleId);

            // Shows success message to user
            console.log(`\n🟢 ${locale.prompts.roleSuccess}`);

            // Waits 2 seconds
            await wait(2);
        };

        // Function to choose a text channel of the guild, that returns its ID (or null if no channel was chosen)
        async function selectTextChannel() {

            // Shows search channel method select menu
            const searchMethod = await select({
                message: `${locale.prompts.selectSearchMethod}:`,
                choices: [
                    { name: locale.prompts.searchChannelByName, value: 'name' },
                    { name: locale.prompts.enterChannelIdManually, value: 'id' },
                    { name: `↩️  ${locale.choices.return}`, value: 'return' }
                ]
            });

            // If the user wants to return, aborts
            if (searchMethod === 'return') return null;

            // If search method is by channel name
            if (searchMethod === 'name') {

                // Prompts user for channel name query
                const query = await input({
                    message: `${locale.prompts.enterChannelNameSearch}:`
                });

                // Fetches guild channels, and filters the text channels by name query
                const channels = await client.baseGuild.channels.fetch();
                const filtered = channels.filter(c => c && c.type === discord.ChannelType.GuildText && c.name.toLowerCase().includes(query.toLowerCase()));

                // If no channels were found
                if (filtered.size === 0) {

                    // Prints error message
                    console.log(`\n🔴 ${locale.prompts.noChannelsFound}.`);

                    // Waits 2 seconds
                    await wait(2);

                    // Returns that no channel was chosen
                    return null;
                };

                // Maps filtered channels to select choice options
                const channelChoices = filtered.map(c => ({
                    name: `#${c.name} - ${c.id}`,
                    value: c.id
                })).slice(0, 25);

                // Pushes return choice option to list
                channelChoices.push({ name: `↩️  ${locale.choices.return}`, value: 'return' });

                // Shows select menu to choose channel
                const selectedChannelId = await select({
                    message: `${locale.prompts.selectChannel}:`,
                    choices: channelChoices
                });

                // Returns the chosen channel, or that no channel was chosen
                return selectedChannelId === 'return' ? null : selectedChannelId;
            };

            // Prompts user for channel ID
            const channelId = (await input({
                message: `${locale.prompts.enterChannelId}:`,
                validate: v => v.trim().length > 0 ? true : locale.prompts.emptyValue
            })).trim();

            // Fetches channel by ID
            const channel = await client.functions.utils.fetch('channel', channelId);

            // If channel is invalid or not text
            if (!channel || channel.type !== discord.ChannelType.GuildText) {

                // Prints error message
                console.log(`\n🔴 ${locale.prompts.noChannelsFound}.`);

                // Waits 2 seconds
                await wait(2);

                // Returns that no channel was chosen
                return null;
            };

            // Returns the chosen channel
            return channel.id;
        };

        // Submenu to configure the public or private welcome
        async function welcomeMenu(type) {

            // Stores the translations and the config path of this type of welcome
            const welcomeLocale = locale.welcomeMenu;
            const configPath = `welcomes.${type}Welcome`;

            // Loop guard variable to stay in the submenu
            let stayInSubmenu = true;

            // Loops while the user does not return
            while (stayInSubmenu) {

                // Clears the console
                await clearConsole();

                // Gets the current settings
                const settings = await client.functions.db.getConfig(configPath);

                // Shows the explanation header
                console.log(`${type === 'public' ? '📢' : '✉️ '} ${welcomeLocale.headers[type]}.\n`);

                // Shows the current message
                console.log(`💬 ${settings.message ? welcomeLocale.customMessage : welcomeLocale.defaultMessage}:\n${(settings.message || client.locale.lib.managers.sendWelcomeMessage.defaultMessages[type]).replaceAll('\\n', '\n')}\n`);

                // Stores the text of the recovery setting
                let recoveryText;
                if (type === 'public') recoveryText = settings.recovery === 'limit' ? `${welcomeLocale.recovery.limit} ${settings.recoveryLimit}` : welcomeLocale.recovery[settings.recovery];
                else recoveryText = settings.recovery ? welcomeLocale.recovery.yes : welcomeLocale.recovery.no;

                // Stores the choices of the menu (the channel is only for public welcomes)
                const choices = [{ name: settings.enabled ? `🔴 ${welcomeLocale.choices.disable}` : `🟢 ${welcomeLocale.choices.enable}`, value: 'toggle' }];
                if (type === 'public') choices.push({ name: `#️⃣  ${welcomeLocale.choices.channel}: ${await getChannelText(settings.channelId)}`, value: 'channel' });
                choices.push(
                    { name: `🎨 ${welcomeLocale.choices.format}: ${welcomeLocale.formats[settings.format]}`, value: 'format' },
                    { name: `📝 ${welcomeLocale.choices.editMessage}`, value: 'editMessage' }
                );
                if (settings.message) choices.push({ name: `🧹 ${welcomeLocale.choices.restoreMessage}`, value: 'restoreMessage' });
                choices.push(
                    { name: `🔁 ${welcomeLocale.choices.recovery}: ${recoveryText}`, value: 'recovery' },
                    { name: `↩️  ${locale.choices.return}`, value: 'return' }
                );

                // Shows the select menu
                const action = await select({
                    message: `${locale.promptMessage}:`,
                    choices: choices
                });

                // Depending on the chosen action
                switch (action) {

                    // If the user wants to enable or disable the welcome
                    case 'toggle':

                        // If enabling a public welcome without a channel, shows an error
                        if (type === 'public' && !settings.enabled && !settings.channelId) {
                            console.log(`\n🔴 ${welcomeLocale.prompts.noChannelError}.`);
                            await wait(3);
                            break;
                        };

                        // Changes the status of the welcome
                        await client.functions.db.setConfig(`${configPath}.enabled`, !settings.enabled);

                        // Breaks the switch
                        break;

                    // If the user wants to change the channel
                    case 'channel':

                        // Asks for the channel
                        const channelId = await selectTextChannel();

                        // If a channel was chosen, stores it
                        if (channelId) {
                            await client.functions.db.setConfig(`${configPath}.channelId`, channelId);
                            console.log(`\n🟢 ${welcomeLocale.prompts.channelSuccess}`);
                            await wait(2);
                        };

                        // Breaks the switch
                        break;

                    // If the user wants to change the format
                    case 'format':

                        // Shows the selection of the format
                        const format = await select({
                            message: `${welcomeLocale.prompts.selectFormat}:`,
                            choices: [
                                { name: welcomeLocale.formats.text, value: 'text' },
                                { name: welcomeLocale.formats.embed, value: 'embed' }
                            ]
                        });

                        // Stores the format
                        await client.functions.db.setConfig(`${configPath}.format`, format);

                        // If the format is an embed, warns that the mentions do not notify inside embeds
                        if (format === 'embed') {
                            console.log(`\n⚠️  ${welcomeLocale.prompts.embedMentionsWarning}.`);
                            await wait(5);
                        };

                        // Breaks the switch
                        break;

                    // If the user wants to edit the message
                    case 'editMessage':

                        // Shows the available wildcards
                        console.log(`ℹ️  ${welcomeLocale.prompts.wildcardsHelp}: {memberMention}, {userName}, {serverName}, {memberCount}`);
                        console.log(`ℹ️  ${welcomeLocale.prompts.lineBreaksHelp}\n`);

                        // Asks for the message
                        const message = await input({
                            message: `${welcomeLocale.prompts.enterMessage}:`,
                            validate: v => {
                                if (v.trim().length === 0) return locale.prompts.emptyValue;
                                if (v.length > 2000) return welcomeLocale.prompts.messageTooLong;
                                return true;
                            }
                        });

                        // Stores the message
                        await client.functions.db.setConfig(`${configPath}.message`, message.trim());

                        // Shows a success message
                        console.log(`\n🟢 ${welcomeLocale.prompts.messageSuccess}`);
                        await wait(2);

                        // Breaks the switch
                        break;

                    // If the user wants to restore the default message
                    case 'restoreMessage':

                        // Clears the custom message, so the default one is used
                        await client.functions.db.setConfig(`${configPath}.message`, '');

                        // Shows a success message
                        console.log(`\n🟢 ${welcomeLocale.prompts.messageRestored}`);
                        await wait(2);

                        // Breaks the switch
                        break;

                    // If the user wants to change the recovery of the welcomes missed while the bot was offline
                    case 'recovery':

                        // Shows an explanation of the recovery
                        console.log(`ℹ️  ${welcomeLocale.prompts.recoveryHelp}.\n`);

                        // If it is a private welcome
                        if (type === 'private') {

                            // Shows the selection of the recovery
                            const recovery = await select({
                                message: `${welcomeLocale.prompts.selectRecovery}:`,
                                choices: [
                                    { name: welcomeLocale.recovery.no, value: false },
                                    { name: welcomeLocale.recovery.yes, value: true }
                                ]
                            });

                            // Stores the recovery
                            await client.functions.db.setConfig(`${configPath}.recovery`, recovery);

                            // Breaks the switch
                            break;
                        };

                        // Shows the selection of the recovery
                        const recovery = await select({
                            message: `${welcomeLocale.prompts.selectRecovery}:`,
                            choices: [
                                { name: welcomeLocale.recovery.none, value: 'none' },
                                { name: welcomeLocale.recovery.all, value: 'all' },
                                { name: welcomeLocale.recovery.limitOption, value: 'limit' }
                            ]
                        });

                        // If only some welcomes can be recovered
                        if (recovery === 'limit') {

                            // Warns that many welcomes in a row can be too many messages
                            console.log(`\n⚠️  ${welcomeLocale.prompts.limitWarning}.\n`);

                            // Asks for the limit
                            const limit = await input({
                                message: `${welcomeLocale.prompts.enterLimit}:`,
                                default: settings.recoveryLimit.toString(),
                                validate: v => /^\d+$/.test(v.trim()) && parseInt(v) >= 1 ? true : welcomeLocale.prompts.invalidLimit
                            });

                            // Stores the limit
                            await client.functions.db.setConfig(`${configPath}.recoveryLimit`, parseInt(limit));
                        };

                        // If all the welcomes can be recovered, warns that many welcomes in a row can be too many messages
                        if (recovery === 'all') {
                            console.log(`\n⚠️  ${welcomeLocale.prompts.limitWarning}.`);
                            await wait(5);
                        };

                        // Stores the recovery
                        await client.functions.db.setConfig(`${configPath}.recovery`, recovery);

                        // Breaks the switch
                        break;

                    // If the user wants to return
                    case 'return':

                        // Exits the loop
                        stayInSubmenu = false;

                        // Breaks the switch
                        break;
                };
            };
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

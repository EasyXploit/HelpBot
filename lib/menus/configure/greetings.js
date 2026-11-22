// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { getSharedLocale, clearConsole, wait, getStatusText, getRoleText, getChannelText, askNumber, selectRole, selectChannel } from '../shared/utils.js';

// Stores the name of the menu and its parent menu
const parentMenuName = new URL(import.meta.url).pathname.split('/').slice(-2, -1)[0];
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Exports a default function
export default async (beforeError) => {

    try {

        // Stores the translations of the bot
        const locale = client.locale.lib.menus[parentMenuName].submenus[menuName];

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
                        name: `👤 ${locale.choices.newMemberRole}: ${getRoleText(newMemberRoleId)}`,
                        value: 'newMemberRole'
                    },
                    {
                        name: `🤖 ${locale.choices.newBotRole}: ${getRoleText(newBotRoleId)}`,
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

            // Asks for the role, with the option to clear it
            const roleId = await selectRole({ allowClear: true });

            // If no role was chosen, aborts
            if (roleId === null) return;

            // Updates the configured role in database (or clears it)
            await client.functions.db.setConfig(configPath, roleId);

            // Shows success message to user
            console.log(`\n🟢 ${roleId ? locale.prompts.roleSuccess : locale.prompts.clearRoleSuccess}`);

            // Waits 2 seconds
            await wait(2);
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
                if (type === 'public') choices.push({ name: `#️⃣  ${welcomeLocale.choices.channel}: ${getChannelText(settings.channelId)}`, value: 'channel' });
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
                        const channelId = await selectChannel();

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
                                if (v.trim().length === 0) return getSharedLocale().emptyValue;
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
                            const limit = await askNumber(welcomeLocale.prompts.enterLimit, settings.recoveryLimit, 1);

                            // Stores the limit
                            await client.functions.db.setConfig(`${configPath}.recoveryLimit`, limit);
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

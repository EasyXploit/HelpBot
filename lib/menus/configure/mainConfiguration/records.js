// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getLocale, clearConsole, wait, getStatusText, drawMenu } from './utils.js';
import { getSharedLocale, getChannelText, selectChannel } from '../../shared/utils.js';

// Stores the list of logging events
const loggingEvents = [
    'warnedMember', 'warnRemoved', 'timeoutedMember', 'untimeoutedMember', 'kickedMember', 'kickedBot', 'bannedMember', 'bannedBot', 'unbannedMember', 'sentDM',
    'pollStarted', 'pollEnded', 'purgedChannel', 'slowmodeChanged', 'experienceModified', 'memberJoined', 'botJoined', 'memberLeaved', 'voiceMoves'
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
            name: `📌 ${currentLocale.prompts.defaultChannel}: ${defaultChannelId ? getChannelText(defaultChannelId) : currentLocale.prompts.noChannel}`,
            value: 'defaultChannel'
        }];

        // Stores the configuration of each logging event
        const eventConfigs = {};
        for (const ev of loggingEvents) eventConfigs[ev] = await client.functions.db.getConfig(`logging.${ev}`) || { enabled: false, channelId: '' };

        // Offers to enable all the records if any is disabled, and to disable them all if any is enabled
        if (loggingEvents.some(ev => !eventConfigs[ev].enabled)) choices.push({ name: `🟢 ${currentLocale.prompts.enableAllRecords}`, value: 'enableAll' });
        if (loggingEvents.some(ev => eventConfigs[ev].enabled)) choices.push({ name: `🔴 ${currentLocale.prompts.disableAllRecords}`, value: 'disableAll' });

        // Loops through each logging event
        for (const ev of loggingEvents) {

            // Gets config for logging event
            const config = eventConfigs[ev];

            // Gets status indicator icon
            const statusText = config.enabled ? '🟢' : '🔴';

            // Stores the display channel name (its own channel, the default one, or none if it is enabled without channel)
            let channelName = '';
            if (config.channelId) channelName = ` (${getChannelText(config.channelId)})`;
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

        // Runs the menu of the default channel, changes the status of all the records, or runs the config menu for selected record event
        if (recordEvent === 'defaultChannel') await defaultChannelMenu();
        else if (recordEvent === 'enableAll' || recordEvent === 'disableAll') await setAllRecords(recordEvent === 'enableAll', eventConfigs, defaultChannelId);
        else await recordEventConfigMenu(recordEvent);
    };
};

// Function to enable or disable all the records at once (when enabling, only the ones with a channel, or all if there is a default channel)
async function setAllRecords(enable, eventConfigs, defaultChannelId) {

    // Gets the current locale translations
    const currentLocale = getLocale();

    // Stores the records whose status has to change, and the ones that can not be enabled because they have no channel
    const toChange = loggingEvents.filter(ev => eventConfigs[ev].enabled !== enable && (!enable || eventConfigs[ev].channelId || defaultChannelId));
    const skipped = enable ? loggingEvents.filter(ev => !eventConfigs[ev].enabled && !eventConfigs[ev].channelId && !defaultChannelId) : [];

    // If no record can be enabled because none has a channel, shows an error
    if (enable && toChange.length === 0) {
        console.log(`\n❌ ${currentLocale.prompts.noChannelConfiguredError}.`);
        await wait(3);
        return;
    };

    // Changes the status of the records
    for (const ev of toChange) await client.functions.db.setConfig(`logging.${ev}.enabled`, enable);

    // Shows how many records have changed, and how many could not be enabled
    console.log(`\n🟢 ${await client.functions.utils.parseLocale(enable ? currentLocale.prompts.allRecordsEnabled : currentLocale.prompts.allRecordsDisabled, { count: toChange.length })}`);
    if (skipped.length > 0) console.log(`⚠️  ${await client.functions.utils.parseLocale(currentLocale.prompts.recordsSkippedNoChannel, { count: skipped.length })}.`);

    // Waits for the user to read the result
    await wait(skipped.length > 0 ? 4 : 2);
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
        message: `${currentLocale.prompts.defaultChannel}: ${defaultChannelId ? getChannelText(defaultChannelId) : currentLocale.prompts.noChannel}`,
        choices: actionChoices
    });

    // If user wants to change the default channel
    if (action === 'channel') {

        // Asks for the channel
        const selectedChanId = await selectChannel();

        // If a channel was chosen
        if (selectedChanId) {

            // Updates the default channel
            await client.functions.db.setConfig('logging.defaultChannelId', selectedChanId);

            // Prints success message
            console.log(`\n🟢 ${currentLocale.prompts.channelSuccess}`);

            // Waits 2 seconds
            await wait(2);
        };

    // If user wants to clear the default channel
    } else if (action === 'clear') {

        // Clears the default channel
        await client.functions.db.setConfig('logging.defaultChannelId', '');

        // Prints success message
        console.log(`\n🟢 ${currentLocale.prompts.defaultChannelCleared}`);

        // Waits 2 seconds
        await wait(2);
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
        if (currentConfig.channelId) channelText = getChannelText(currentConfig.channelId);
        else if (defaultChannelId) channelText = `${getChannelText(defaultChannelId)} (${currentLocale.prompts.byDefault})`;

        // Shows the record, its status and its channel
        console.log(`🗄️  ${currentLocale.records[recordEvent]}: ${getStatusText(currentConfig.enabled)} · ${channelText}\n`);

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
        if (recordEvent === 'voiceMoves') actionChoices.push({ name: `🔇 ${currentLocale.prompts.excludedChannels} (${(await client.functions.db.getConfig('moderation.voiceMovesExcludedChannels') || []).length})`, value: 'excludedChannels' });
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
                await wait(3);

                // Continues the loop
                continue;
            };

            // Toggles enabled status of logging event
            await client.functions.db.setConfig(`logging.${recordEvent}.enabled`, !currentConfig.enabled);

        // If user wants to change target channel
        } else if (recordAction === 'channel') {

            // Asks for the channel
            const selectedChanId = await selectChannel();

            // If a channel was chosen
            if (selectedChanId) {

                // Updates logging event target channel
                await client.functions.db.setConfig(`logging.${recordEvent}.channelId`, selectedChanId);

                // Prints success message
                console.log(`\n🟢 ${currentLocale.prompts.channelSuccess}`);

                // Waits 2 seconds
                await wait(2);
            };

        // If user wants to manage the channels excluded from the voice moves record
        } else if (recordAction === 'excludedChannels') {

            // Shows the excluded channels menu
            await excludedChannelsMenu();

        // If user wants the record to use the default channel
        } else if (recordAction === 'useDefault') {

            // Clears the channel of the record, so it uses the default one
            await client.functions.db.setConfig(`logging.${recordEvent}.channelId`, '');

            // Prints success message
            console.log(`\n🟢 ${currentLocale.prompts.useDefaultChannelSuccess}`);

            // Waits 2 seconds
            await wait(2);
        };
    };
};

// Submenu to manage the voice channels excluded from the voice moves record
async function excludedChannelsMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current list
        const currentLocale = getLocale();
        const excludedChannels = [...(await client.functions.db.getConfig('moderation.voiceMovesExcludedChannels') || [])];

        // Shows the explanation header and the list
        console.log(`🔇 ${currentLocale.prompts.excludedChannelsHeader}.\n`);
        console.log(excludedChannels.length > 0 ? excludedChannels.map(id => `  • ${getChannelText(id)}`).join('\n') + '\n' : `  ${getSharedLocale().emptyList}\n`);

        // Stores the choices (a channel can only be removed if there is any)
        const choices = [{ name: `➕ ${currentLocale.prompts.addExcludedChannel}`, value: 'add' }];
        if (excludedChannels.length > 0) choices.push({ name: `➖ ${currentLocale.prompts.removeExcludedChannel}`, value: 'remove' });
        choices.push({ name: `↩️  ${currentLocale.choices.return}`, value: 'return' });

        // Shows the select menu
        const action = await select({
            message: `${currentLocale.prompts.recordAction}:`,
            choices: choices
        });

        // If the user wants to return, aborts
        if (action === 'return') return;

        // If the user wants to add a channel
        if (action === 'add') {

            // Asks for a voice channel
            const channelId = await selectChannel([discord.ChannelType.GuildVoice, discord.ChannelType.GuildStageVoice]);

            // Adds it, if it is not in the list yet
            if (channelId && !excludedChannels.includes(channelId)) await client.functions.db.setConfig('moderation.voiceMovesExcludedChannels', [...excludedChannels, channelId]);

        // If the user wants to remove a channel
        } else {

            // Asks for the channel to remove
            const channelId = await select({
                message: `${currentLocale.prompts.selectExcludedChannelToRemove}:`,
                choices: [...excludedChannels.map(id => ({ name: getChannelText(id), value: id })), { name: `↩️  ${currentLocale.choices.return}`, value: 'return' }]
            });

            // Removes it
            if (channelId !== 'return') await client.functions.db.setConfig('moderation.voiceMovesExcludedChannels', excludedChannels.filter(id => id !== channelId));
        };
    };
};

// Exports the submenu
export default recordsMenu;

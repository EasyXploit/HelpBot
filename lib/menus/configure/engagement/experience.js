// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { stopInterval, startInterval } from '../../../loaders/intervals.js';
import { getSharedLocale, clearConsole, getStatusText, getRoleText, getChannelText, askNumber, selectRole, selectChannel } from '../../shared/utils.js';
import { getLocale, offerRewardsUpdate } from './utils.js';
import rewardsMenu from './rewards.js';

// Submenu to manage a list of roles or channels of the leveling configuration
async function listMenu(configKey, type) {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current list
        const locale = getLocale().experienceMenu.lists[configKey];
        const list = [...(await client.functions.db.getConfig(`leveling.${configKey}`) || [])];

        // Shows the explanation header and the list
        console.log(`${type === 'role' ? '🚫' : '🔇'} ${locale.headerMessage}.\n`);
        console.log(list.length > 0 ? list.map(id => `  • ${type === 'role' ? getRoleText(id) : getChannelText(id)}`).join('\n') + '\n' : `  ${getSharedLocale().emptyList}\n`);

        // Stores the choices (an item can only be removed if there is any)
        const choices = [{ name: `➕ ${locale.add}`, value: 'add' }];
        if (list.length > 0) choices.push({ name: `➖ ${locale.remove}`, value: 'remove' });
        choices.push({ name: `↩️  ${getSharedLocale().return}`, value: 'return' });

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: choices
        });

        // If the user wants to return, aborts
        if (action === 'return') return;

        // If the user wants to add an item
        if (action === 'add') {

            // Asks for the role or channel
            const id = type === 'role' ? await selectRole() : await selectChannel([discord.ChannelType.GuildText, discord.ChannelType.GuildAnnouncement, discord.ChannelType.GuildVoice, discord.ChannelType.GuildStageVoice]);

            // Adds it, if it is not in the list yet
            if (id && !list.includes(id)) await client.functions.db.setConfig(`leveling.${configKey}`, [...list, id]);

        // If the user wants to remove an item
        } else {

            // Asks for the item to remove
            const id = await select({
                message: `${locale.selectToRemove}:`,
                choices: [...list.map(id => ({ name: type === 'role' ? getRoleText(id) : getChannelText(id), value: id })), { name: `↩️  ${getSharedLocale().return}`, value: 'return' }]
            });

            // Removes it
            if (id !== 'return') await client.functions.db.setConfig(`leveling.${configKey}`, list.filter(otherId => otherId !== id));
        };
    };
};

// Submenu to configure the experience system
export default async function experienceMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current settings
        const locale = getLocale().experienceMenu;
        const leveling = await client.functions.db.getConfig('leveling');

        // Shows the explanation header
        console.log(`⭐ ${locale.headerMessage}.\n`);

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            pageSize: 15,
            choices: [
                { name: leveling.experienceSystemEnabled ? `🔴 ${getLocale().choices.changeExperienceSystemStatus.disable}` : `🟢 ${getLocale().choices.changeExperienceSystemStatus.enable}`, value: 'changeExperienceSystemStatus' },
                { name: `🏆 ${locale.choices.rewards} (${leveling.rewards.length})`, value: 'rewards' },
                { name: `💬 ${locale.choices.rewardMessages}: ${getStatusText(leveling.rewardMessages)}`, value: 'rewardMessages' },
                { name: `🎙️  ${locale.choices.rewardVoice}: ${getStatusText(leveling.rewardVoice)}`, value: 'rewardVoice' },
                { name: `🔢 ${locale.choices.xpReward}: ${leveling.minimumXpReward} - ${leveling.maximumXpReward}`, value: 'xpReward' },
                { name: `⏱️  ${locale.choices.XPGainInterval}: ${leveling.XPGainInterval / 1000} s`, value: 'XPGainInterval' },
                { name: `⌛ ${locale.choices.minimumTimeBetweenMessages}: ${leveling.minimumTimeBetweenMessages / 1000} s`, value: 'minimumTimeBetweenMessages' },
                { name: `🚫 ${locale.choices.wontEarnXP} (${leveling.wontEarnXP.length})`, value: 'wontEarnXP' },
                { name: `🔇 ${locale.choices.nonXPChannels} (${leveling.nonXPChannels.length})`, value: 'nonXPChannels' },
                { name: `📣 ${locale.choices.notifyLevelUpOnChat}: ${getStatusText(leveling.notifyLevelUpOnChat)}`, value: 'notifyLevelUpOnChat' },
                { name: `✉️  ${locale.choices.notifyLevelUpOnVoice}: ${getStatusText(leveling.notifyLevelUpOnVoice)}`, value: 'notifyLevelUpOnVoice' },
                { name: `↩️  ${getSharedLocale().return}`, value: 'return' }
            ]
        });

        // Depending on the chosen action
        switch (action) {

            // If the user wants to return to the engagement menu
            case 'return': {
                const engagementMenu = await import('../engagement.js');
                return await engagementMenu.default();
            };

            // If the user wants to enable or disable the experience system
            case 'changeExperienceSystemStatus': {

                // Changes the experience system status
                await client.functions.db.setConfig('leveling.experienceSystemEnabled', !leveling.experienceSystemEnabled);

                // Offers to update the reward roles, if the experience system has started or stopped being active (the module must be enabled)
                const isModuleEnabled = await client.functions.db.getConfig('system.modules.engagement');
                await offerRewardsUpdate(isModuleEnabled && leveling.experienceSystemEnabled, isModuleEnabled && !leveling.experienceSystemEnabled);
                break;
            };

            // If the user wants to manage the rewards
            case 'rewards':
                await rewardsMenu();
                break;

            // If the user wants to change a setting that is enabled or disabled
            case 'rewardMessages':
            case 'notifyLevelUpOnChat':
            case 'notifyLevelUpOnVoice':
                await client.functions.db.setConfig(`leveling.${action}`, !leveling[action]);
                break;

            // If the user wants to change whether XP is earned in voice channels
            case 'rewardVoice':

                // Changes the setting
                await client.functions.db.setConfig('leveling.rewardVoice', !leveling.rewardVoice);

                // If it has been enabled, starts counting the members that are already in voice channels, and if it has been disabled, stops counting them
                if (!leveling.rewardVoice) await client.functions.leveling.loadVoiceStates();
                else if (client.usersVoiceStates) delete client.usersVoiceStates;
                break;

            // If the user wants to change the XP earned by reward
            case 'xpReward': {

                // Asks for the minimum and the maximum (that can not be lower than the minimum)
                const minimum = await askNumber(locale.prompts.enterMinimumXp, leveling.minimumXpReward, 1);
                const maximum = await askNumber(locale.prompts.enterMaximumXp, Math.max(leveling.maximumXpReward, minimum), minimum);

                // Stores them
                await client.functions.db.setConfig('leveling.minimumXpReward', minimum);
                await client.functions.db.setConfig('leveling.maximumXpReward', maximum);
                break;
            };

            // If the user wants to change the interval to earn XP in voice channels
            case 'XPGainInterval': {

                // Asks for the interval, in seconds
                const seconds = await askNumber(locale.prompts.enterXPGainInterval, leveling.XPGainInterval / 1000, 10);

                // Stores it, in milliseconds
                await client.functions.db.setConfig('leveling.XPGainInterval', seconds * 1000);

                // Updates the interval of the voice time, and restarts it if it was running
                if (client.intervals && client.intervals.updateVoiceTime) {
                    const wasRunning = !!client.intervals.updateVoiceTime.id;
                    stopInterval('updateVoiceTime');
                    client.intervals.updateVoiceTime.interval = seconds * 1000;
                    if (wasRunning) startInterval('updateVoiceTime');
                };
                break;
            };

            // If the user wants to change the minimum time between messages to earn XP
            case 'minimumTimeBetweenMessages': {

                // Asks for the time, in seconds, and stores it in milliseconds
                const seconds = await askNumber(locale.prompts.enterMinimumTimeBetweenMessages, leveling.minimumTimeBetweenMessages / 1000, 0);
                await client.functions.db.setConfig('leveling.minimumTimeBetweenMessages', seconds * 1000);
                break;
            };

            // If the user wants to manage the roles that won't earn XP
            case 'wontEarnXP':
                await listMenu('wontEarnXP', 'role');
                break;

            // If the user wants to manage the channels without XP
            case 'nonXPChannels':
                await listMenu('nonXPChannels', 'channel');
                break;

        };
    };
};

// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getSharedLocale, clearConsole, wait, getStatusText, confirm } from '../../shared/utils.js';
import { getLocale } from './utils.js';

// Function to delete the statistics of the members that are no longer in the guild, asking for confirmation first
async function offerDeletingAbsentStats() {

    // Stores the translations
    const locale = getLocale().statisticsMenu.prompts;

    // Stores the profiles with statistics of the members that are no longer in the guild
    const profiles = await client.functions.db.getData('profile') || [];
    const members = await client.baseGuild.members.fetch();
    const absentProfiles = profiles.filter(profile => !members.has(profile.userId) && ['experience', 'level', 'aproxVoiceTime', 'messagesCount'].some(statistic => profile.stats[statistic] > 0));

    // Aborts if there are no statistics to delete
    if (absentProfiles.length === 0) return;

    // Asks for confirmation, warning that it can not be undone
    console.log(`\n⚠️  ${await client.functions.utils.parseLocale(locale.deleteAbsentStatsWarning, { count: absentProfiles.length })}.\n`);
    if (!await confirm(locale.deleteAbsentStatsPrompt)) return;

    // Resets the statistics, one by one (keeping the warnings history)
    for (const profile of absentProfiles) await client.functions.leveling.resetStats(profile.userId);

    // Shows the result
    console.log(`\n🟢 ${await client.functions.utils.parseLocale(locale.absentStatsDeleted, { count: absentProfiles.length })}.`);
    await wait(3);
};

// Submenu to configure the statistics
export default async function statisticsMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current settings
        const locale = getLocale().statisticsMenu;
        const statisticsCollectionEnabled = await client.functions.db.getConfig('leveling.statisticsCollectionEnabled');
        const preserveStats = await client.functions.db.getConfig('leveling.preserveStats');

        // Shows the explanation header
        console.log(`📊 ${locale.headerMessage}.\n`);

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: [
                { name: statisticsCollectionEnabled ? `🔴 ${getLocale().choices.changeStatisticsCollectionStatus.disable}` : `🟢 ${getLocale().choices.changeStatisticsCollectionStatus.enable}`, value: 'changeStatisticsCollectionStatus' },
                { name: `💾 ${locale.choices.preserveStats}: ${getStatusText(preserveStats)}`, value: 'preserveStats' },
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

            // If the user wants to enable or disable the statistics collection
            case 'changeStatisticsCollectionStatus':
                await client.functions.db.setConfig('leveling.statisticsCollectionEnabled', !statisticsCollectionEnabled);
                break;

            // If the user wants to change whether the statistics of the members who leave are preserved
            case 'preserveStats':

                // Changes the setting
                await client.functions.db.setConfig('leveling.preserveStats', !preserveStats);

                // If it has been disabled, offers to delete the statistics of the members that are no longer in the guild
                if (preserveStats) await offerDeletingAbsentStats();
                break;
        };
    };
};

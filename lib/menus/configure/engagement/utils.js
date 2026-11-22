// Imports the necessary libraries
import { confirm, wait } from '../../shared/utils.js';

// Function to get the translations of the engagement menu
export function getLocale() {
    return client.locale.lib.menus.configure.submenus.engagement;
};

// Function to offer removing or recalculating the reward roles of all the members, when the experience system stops or starts being active
export async function offerRewardsUpdate(wasActive, isActive) {

    // Stores the translations
    const locale = getLocale().rewardsUpdate;

    // Aborts if the status of the experience system has not changed
    if (wasActive === isActive) return;

    // Aborts if there are no rewards
    const levelingRewards = await client.functions.db.getConfig('leveling.rewards');
    if (!levelingRewards || levelingRewards.length === 0) return;

    // Asks whether the reward roles have to be removed or recalculated, and aborts if not
    if (!await confirm(isActive ? locale.recalculatePrompt : locale.removePrompt)) return;

    // Shows that the roles are being updated
    console.log(`\n⏳ ${locale.processing}...`);

    // Recalculates the reward roles if the experience system has started being active, or removes them if it has stopped
    const result = isActive ? await client.functions.leveling.recalculateAllRewards() : await client.functions.leveling.removeAllRewards();

    // Shows the result
    if (result === null) console.log(`\n❌ ${locale.missingPermissions}.`);
    else console.log(`\n🟢 ${await client.functions.utils.parseLocale(isActive ? locale.recalculated : locale.removed, { count: result })}.`);

    // Waits 3 seconds
    await wait(3);
};

// Function to reset some statistics of the members that are no longer in the guild, asking for confirmation first (keeping their warnings history)
export async function offerResettingAbsent(statistics, texts) {

    // Stores the profiles of the members that are no longer in the guild and have any of those statistics
    const profiles = await client.functions.db.getData('profile') || [];
    const members = await client.functions.utils.getAllMembers();
    const absentProfiles = profiles.filter(profile => !members.has(profile.userId) && statistics.some(statistic => profile.stats[statistic] > 0));

    // Aborts if there are no statistics to reset
    if (absentProfiles.length === 0) return;

    // Asks for confirmation, warning that it can not be undone
    console.log(`\n⚠️  ${await client.functions.utils.parseLocale(texts.warning, { count: absentProfiles.length })}.\n`);
    if (!await confirm(texts.prompt)) return;

    // Resets the statistics, one by one
    for (const profile of absentProfiles) await client.functions.leveling.resetStats(profile.userId, statistics);

    // Shows the result
    console.log(`\n🟢 ${await client.functions.utils.parseLocale(texts.done, { count: absentProfiles.length })}.`);
    await wait(3);
};

// Function to reset some statistics of all the members, asking for confirmation first, that returns whether they were reset
export async function offerResettingAll(statistics, texts) {

    // Asks for confirmation, warning that it can not be undone
    console.log(`\n⚠️  ${texts.warning}.\n`);
    if (!await confirm(texts.prompt)) return false;

    // Resets the statistics of all the profiles
    await client.functions.db.setData('profile', null, { $set: Object.fromEntries(statistics.map(statistic => [`stats.${statistic}`, 0])) });

    // Shows the result
    console.log(`\n🟢 ${texts.done}.`);
    await wait(3);

    // Returns that they were reset
    return true;
};

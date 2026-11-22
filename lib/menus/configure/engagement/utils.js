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

// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getSharedLocale, clearConsole, wait, getStatusText, getRoleText, confirm, askNumber, selectRole } from '../../shared/utils.js';
import { getLocale } from './utils.js';

// Function to get the rewards, sorted by level and as plain objects
async function getRewards() {
    const rewards = await client.functions.db.getConfig('leveling.rewards') || [];
    return rewards.map(reward => ({ requiredLevel: reward.requiredLevel, roles: [...reward.roles] })).sort((a, b) => a.requiredLevel - b.requiredLevel);
};

// Function to warn if a role is above the highest role of the bot, so the bot could not give it
async function warnIfNotAssignable(roleId) {
    const role = client.baseGuild.roles.cache.get(roleId);
    if (role && role.position >= client.baseGuild.members.me.roles.highest.position) {
        console.log(`\n⚠️  ${getLocale().rewardsMenu.prompts.roleAboveBot}.`);
        await wait(4);
    };
};

// Submenu to manage the level rewards, that returns whether something was changed
export default async function rewardsMenu() {

    // Stores whether the rewards were changed
    let changed = false;

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current settings
        const locale = getLocale().rewardsMenu;
        const rewards = await getRewards();
        const removePreviousRewards = await client.functions.db.getConfig('leveling.removePreviousRewards');

        // Shows the explanation header
        console.log(`🏆 ${locale.headerMessage}.\n`);

        // Stores the choices: the rewards, and the general options
        const choices = rewards.map(reward => ({
            name: `🎖️  ${locale.level} ${reward.requiredLevel}: ${reward.roles.map(roleId => getRoleText(roleId)).join(', ')}`,
            value: reward.requiredLevel
        }));
        choices.push(
            { name: `➕ ${locale.choices.addReward}`, value: 'add' },
            { name: `🔁 ${locale.choices.removePreviousRewards}: ${getStatusText(removePreviousRewards)}`, value: 'removePreviousRewards' },
            { name: `↩️  ${getSharedLocale().return}`, value: 'return' }
        );

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: choices
        });

        // If the user wants to return
        if (action === 'return') {

            // If something was changed and the experience system is active, offers to recalculate the roles of all the members
            if (changed && await client.functions.db.getConfig('system.modules.engagement') && await client.functions.db.getConfig('leveling.experienceSystemEnabled')) {

                // Asks whether to recalculate the roles
                if (await confirm(locale.prompts.recalculatePrompt)) {

                    // Recalculates the roles and shows the result
                    console.log(`\n⏳ ${getLocale().rewardsUpdate.processing}...`);
                    const result = await client.functions.leveling.recalculateAllRewards();
                    if (result === null) console.log(`\n❌ ${getLocale().rewardsUpdate.missingPermissions}.`);
                    else console.log(`\n🟢 ${await client.functions.utils.parseLocale(getLocale().rewardsUpdate.recalculated, { count: result })}.`);
                    await wait(3);
                };
            };

            // Returns whether something was changed
            return changed;
        };

        // If the user wants to change whether the previous rewards are removed
        if (action === 'removePreviousRewards') {
            await client.functions.db.setConfig('leveling.removePreviousRewards', !removePreviousRewards);
            changed = true;
            continue;
        };

        // If the user wants to add a reward
        if (action === 'add') {

            // Asks for the level
            const level = await askNumber(locale.prompts.enterLevel, undefined, 1);

            // Asks for the role
            const roleId = await selectRole();
            if (!roleId) continue;

            // Adds the role to the reward of that level, or creates it
            const reward = rewards.find(reward => reward.requiredLevel === level);
            if (reward) {
                if (!reward.roles.includes(roleId)) reward.roles.push(roleId);
            } else rewards.push({ requiredLevel: level, roles: [roleId] });

            // Stores the rewards
            await client.functions.db.setConfig('leveling.rewards', rewards);
            changed = true;

            // Shows a success message, and warns if the bot could not give the role
            console.log(`\n🟢 ${locale.prompts.rewardSaved}`);
            await wait(2);
            await warnIfNotAssignable(roleId);
            continue;
        };

        // If the user chose a reward, shows its menu
        if (await rewardMenu(action)) changed = true;
    };
};

// Submenu to edit a reward, that returns whether something was changed
async function rewardMenu(requiredLevel) {

    // Stores whether the reward was changed
    let changed = false;

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the reward
        const locale = getLocale().rewardsMenu;
        const rewards = await getRewards();
        const reward = rewards.find(reward => reward.requiredLevel === requiredLevel);

        // If the reward no longer exists, returns
        if (!reward) return changed;

        // Shows the reward
        console.log(`🎖️  ${locale.level} ${reward.requiredLevel}: ${reward.roles.map(roleId => getRoleText(roleId)).join(', ')}\n`);

        // Stores the choices (a role can only be removed if there is more than one)
        const choices = [
            { name: `🔢 ${locale.choices.changeLevel}`, value: 'changeLevel' },
            { name: `➕ ${locale.choices.addRole}`, value: 'addRole' }
        ];
        if (reward.roles.length > 1) choices.push({ name: `➖ ${locale.choices.removeRole}`, value: 'removeRole' });
        choices.push(
            { name: `🗑️  ${locale.choices.deleteReward}`, value: 'delete' },
            { name: `↩️  ${getSharedLocale().return}`, value: 'return' }
        );

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: choices
        });

        // Depending on the chosen action
        switch (action) {

            // If the user wants to return
            case 'return':
                return changed;

            // If the user wants to change the level of the reward
            case 'changeLevel': {

                // Asks for the new level
                const newLevel = await askNumber(locale.prompts.enterLevel, reward.requiredLevel, 1);

                // If there is another reward with that level, shows an error
                if (newLevel !== reward.requiredLevel && rewards.some(otherReward => otherReward.requiredLevel === newLevel)) {
                    console.log(`\n🔴 ${locale.prompts.levelInUse}.`);
                    await wait(3);
                    break;
                };

                // Stores the new level
                reward.requiredLevel = newLevel;
                requiredLevel = newLevel;
                await client.functions.db.setConfig('leveling.rewards', rewards);
                changed = true;
                break;
            };

            // If the user wants to add a role to the reward
            case 'addRole': {

                // Asks for the role
                const roleId = await selectRole();
                if (!roleId) break;

                // Adds the role, if the reward does not have it yet
                if (!reward.roles.includes(roleId)) {
                    reward.roles.push(roleId);
                    await client.functions.db.setConfig('leveling.rewards', rewards);
                    changed = true;
                };

                // Warns if the bot could not give the role
                await warnIfNotAssignable(roleId);
                break;
            };

            // If the user wants to remove a role from the reward
            case 'removeRole': {

                // Asks for the role to remove
                const roleId = await select({
                    message: `${locale.prompts.selectRoleToRemove}:`,
                    choices: [...reward.roles.map(roleId => ({ name: getRoleText(roleId), value: roleId })), { name: `↩️  ${getSharedLocale().return}`, value: 'return' }]
                });
                if (roleId === 'return') break;

                // Removes the role
                reward.roles = reward.roles.filter(otherRoleId => otherRoleId !== roleId);
                await client.functions.db.setConfig('leveling.rewards', rewards);
                changed = true;
                break;
            };

            // If the user wants to delete the reward
            case 'delete': {

                // Asks for confirmation
                if (!await confirm(locale.prompts.deleteConfirmation)) break;

                // Deletes the reward
                await client.functions.db.setConfig('leveling.rewards', rewards.filter(otherReward => otherReward.requiredLevel !== reward.requiredLevel));
                return true;
            };
        };
    };
};

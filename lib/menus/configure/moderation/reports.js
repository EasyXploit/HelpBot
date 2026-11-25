// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getSharedLocale, clearConsole, wait, getStatusText, getChannelText, getRoleText, selectChannel, selectRole } from '../../shared/utils.js';

// Function to get the translations of the reports menu
function getLocale() {
    return client.locale.lib.menus.configure.submenus.moderation.reportsMenu;
};

// Submenu to configure the reports
export default async function reportsMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current settings
        const locale = getLocale();
        const reportsConfig = await client.functions.db.getConfig('moderation.reports');

        // Shows the explanation header and the current status
        console.log(`📢 ${locale.headerMessage}.\n`);
        console.log(`${locale.status}: ${getStatusText(reportsConfig.enabled)}\n`);

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: [
                { name: reportsConfig.enabled ? `🔴 ${locale.choices.disable}` : `🟢 ${locale.choices.enable}`, value: 'toggle' },
                { name: `#️⃣  ${locale.choices.channel}: ${getChannelText(reportsConfig.channelId)}`, value: 'channel' },
                { name: `🔔 ${locale.choices.mentionRoles} (${reportsConfig.mentionRoles.length})`, value: 'mentionRoles' },
                { name: `↩️  ${getSharedLocale().return}`, value: 'return' }
            ]
        });

        // Depending on the chosen action
        switch (action) {

            // If the user wants to return to the moderation menu
            case 'return': {
                const moderationMenu = await import('../moderation.js');
                return await moderationMenu.default();
            };

            // If the user wants to enable or disable the reports
            case 'toggle': {

                // If they are being enabled without a channel, warns that it has to be configured first
                if (!reportsConfig.enabled && !reportsConfig.channelId) {
                    console.log(`\n❌ ${locale.prompts.noChannelError}.`);
                    await wait(3);
                    break;
                };

                // Changes the status
                await client.functions.db.setConfig('moderation.reports.enabled', !reportsConfig.enabled);
                break;
            };

            // If the user wants to change the channel of the reports
            case 'channel': {

                // Asks for the channel, and stores it if one was selected
                const channelId = await selectChannel([discord.ChannelType.GuildText]);
                if (channelId) {
                    await client.functions.db.setConfig('moderation.reports.channelId', channelId);
                    console.log(`\n🟢 ${locale.prompts.channelSuccess}`);
                    await wait(2);
                };
                break;
            };

            // If the user wants to configure the roles to mention
            case 'mentionRoles':
                await mentionRolesMenu();
                break;
        };
    };
};

// Submenu to configure the roles to mention when a new report is received
async function mentionRolesMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current roles
        const locale = getLocale();
        const mentionRoles = [...(await client.functions.db.getConfig('moderation.reports.mentionRoles') || [])];

        // Shows the explanation header and the current roles
        console.log(`🔔 ${locale.prompts.mentionRolesHeader}.\n`);
        console.log(mentionRoles.length > 0 ? mentionRoles.map(roleId => `  • ${getRoleText(roleId)}`).join('\n') + '\n' : `  ${getSharedLocale().emptyList}\n`);

        // Generates the choices
        const choices = [{ name: `➕ ${locale.prompts.addRole}`, value: 'add' }];
        if (mentionRoles.length > 0) choices.push({ name: `➖ ${locale.prompts.removeRole}`, value: 'remove' });
        choices.push({ name: `↩️  ${getSharedLocale().return}`, value: 'return' });

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: choices
        });

        // If the user wants to return, returns to the reports menu
        if (action === 'return') return;

        // If the user wants to add a role
        if (action === 'add') {

            // Asks for the role, and adds it if one was selected and it was not already on the list
            const roleId = await selectRole();
            if (roleId && !mentionRoles.includes(roleId)) await client.functions.db.setConfig('moderation.reports.mentionRoles', [...mentionRoles, roleId]);

        // If the user wants to remove a role
        } else {

            // Asks for the role to remove, and removes it if one was selected
            const roleId = await select({
                message: `${locale.prompts.selectRoleToRemove}:`,
                choices: [...mentionRoles.map(roleId => ({ name: getRoleText(roleId), value: roleId })), { name: `↩️  ${getSharedLocale().return}`, value: 'return' }]
            });
            if (roleId !== 'return') await client.functions.db.setConfig('moderation.reports.mentionRoles', mentionRoles.filter(otherRoleId => otherRoleId !== roleId));
        };
    };
};

// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getSharedLocale, clearConsole, wait, getStatusText, getChannelText, getRoleText, getMemberText, selectChannel, selectRole, selectMember, askNumber } from '../../shared/utils.js';

// Stores the sanctions that can be applied from the reports
const quickActionTypes = ['warn', 'deleteMessage', 'timeout', 'kick', 'ban'];

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

        // Stores the texts of the limits
        const limits = reportsConfig.limits;
        const limitText = limits.maxReports > 0 ? await client.functions.utils.parseLocale(locale.prompts.limitText, { count: limits.maxReports, minutes: limits.timeWindow / 60000 }) : client.locale.status.disabled;
        const cooldownText = limits.sameMemberCooldown > 0 ? await client.functions.utils.parseLocale(locale.prompts.minutesText, { minutes: limits.sameMemberCooldown / 60000 }) : client.locale.status.disabled;

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: [
                { name: reportsConfig.enabled ? `🔴 ${locale.choices.disable}` : `🟢 ${locale.choices.enable}`, value: 'toggle' },
                { name: `#️⃣  ${locale.choices.channel}: ${getChannelText(reportsConfig.channelId)}`, value: 'channel' },
                { name: `🛡️  ${locale.choices.handlers} (${reportsConfig.handlers.length})`, value: 'handlers' },
                { name: `🔔 ${locale.choices.mentionRoles} (${reportsConfig.mentionRoles.length})`, value: 'mentionRoles' },
                { name: `⚡ ${locale.choices.quickActions} (${reportsConfig.quickActions.length}/${quickActionTypes.length})`, value: 'quickActions' },
                { name: `🔇 ${locale.choices.timeoutDurations} (${reportsConfig.timeoutDurations.length})`, value: 'timeoutDurations' },
                { name: `⏱️  ${locale.choices.limit}: ${limitText}`, value: 'limit' },
                { name: `👤 ${locale.choices.sameMemberCooldown}: ${cooldownText}`, value: 'sameMemberCooldown' },
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

            // If the user wants to configure the members and roles that can handle the reports
            case 'handlers':
                await handlersMenu();
                break;

            // If the user wants to configure the roles to mention
            case 'mentionRoles':
                await mentionRolesMenu();
                break;

            // If the user wants to configure the sanctions that can be applied from the reports
            case 'quickActions':
                await quickActionsMenu();
                break;

            // If the user wants to configure the durations of the timeouts that can be applied from the reports
            case 'timeoutDurations':
                await timeoutDurationsMenu();
                break;

            // If the user wants to change the limit of reports in a time window
            case 'limit': {

                // Asks for the maximum amount of reports, and for the time window if the limit is enabled
                const maxReports = await askNumber(locale.prompts.enterMaxReports, limits.maxReports, 0);
                const minutes = maxReports > 0 ? await askNumber(locale.prompts.enterTimeWindow, limits.timeWindow / 60000, 1) : limits.timeWindow / 60000;

                // Stores them (the time window in milliseconds)
                await client.functions.db.setConfig('moderation.reports.limits.maxReports', maxReports);
                await client.functions.db.setConfig('moderation.reports.limits.timeWindow', minutes * 60000);
                break;
            };

            // If the user wants to change the time to wait to report the same member again
            case 'sameMemberCooldown': {

                // Asks for the time in minutes, and stores it in milliseconds
                const minutes = await askNumber(locale.prompts.enterSameMemberCooldown, limits.sameMemberCooldown / 60000, 0);
                await client.functions.db.setConfig('moderation.reports.limits.sameMemberCooldown', minutes * 60000);
                break;
            };
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

// Function to get the text of a handler of the reports, which can be a role or a member
async function getHandlerText(handlerId) {

    // If it is a role, returns its name
    if (client.baseGuild.roles.cache.has(handlerId)) return `👥 ${getRoleText(handlerId)}`;

    // Otherwise, returns the name of the member (or its Id, if it is not found)
    return `👤 ${await getMemberText(handlerId)}`;
};

// Submenu to configure the members and roles that can handle the reports
async function handlersMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current handlers
        const locale = getLocale();
        const handlers = [...(await client.functions.db.getConfig('moderation.reports.handlers') || [])];

        // Shows the explanation header and the current handlers
        console.log(`🛡️  ${locale.prompts.handlersHeader}.\n`);
        if (handlers.length === 0) console.log(`  ${getSharedLocale().emptyList}\n`);
        else {
            for (const handlerId of handlers) console.log(`  • ${await getHandlerText(handlerId)}`);
            console.log();
        };

        // Generates the choices
        const choices = [
            { name: `➕ ${locale.prompts.addMember}`, value: 'addMember' },
            { name: `➕ ${locale.prompts.addRole}`, value: 'addRole' }
        ];
        if (handlers.length > 0) choices.push({ name: `➖ ${locale.prompts.removeHandler}`, value: 'remove' });
        choices.push({ name: `↩️  ${getSharedLocale().return}`, value: 'return' });

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: choices
        });

        // If the user wants to return, returns to the reports menu
        if (action === 'return') return;

        // If the user wants to add a member or a role
        if (action === 'addMember' || action === 'addRole') {

            // Asks for it, and adds it if one was selected and it was not already on the list
            const handlerId = action === 'addMember' ? await selectMember() : await selectRole();
            if (handlerId && !handlers.includes(handlerId)) await client.functions.db.setConfig('moderation.reports.handlers', [...handlers, handlerId]);

        // If the user wants to remove a handler
        } else {

            // Generates the choices with the current handlers
            const handlerChoices = [];
            for (const handlerId of handlers) handlerChoices.push({ name: `${await getHandlerText(handlerId)} - ${handlerId}`, value: handlerId });

            // Asks for the handler to remove, and removes it if one was selected
            const handlerId = await select({
                message: `${locale.prompts.selectHandlerToRemove}:`,
                choices: [...handlerChoices, { name: `↩️  ${getSharedLocale().return}`, value: 'return' }]
            });
            if (handlerId !== 'return') await client.functions.db.setConfig('moderation.reports.handlers', handlers.filter(otherHandlerId => otherHandlerId !== handlerId));
        };
    };
};

// Submenu to configure the sanctions that can be applied from the reports
async function quickActionsMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current sanctions
        const locale = getLocale();
        const quickActions = await client.functions.db.getConfig('moderation.reports.quickActions') || [];

        // Shows the explanation header
        console.log(`⚡ ${locale.prompts.quickActionsHeader}.\n`);

        // Shows the select menu, with the status of each sanction
        const action = await select({
            message: `${locale.prompts.selectQuickAction}:`,
            choices: [
                ...quickActionTypes.map(type => ({ name: `${quickActions.includes(type) ? '🟢' : '🔴'} ${locale.prompts.quickActionNames[type]}`, value: type })),
                { name: `↩️  ${getSharedLocale().return}`, value: 'return' }
            ]
        });

        // If the user wants to return, returns to the reports menu
        if (action === 'return') return;

        // Enables or disables the sanction (keeping the original order)
        await client.functions.db.setConfig('moderation.reports.quickActions', quickActions.includes(action) ? quickActions.filter(type => type !== action) : quickActionTypes.filter(type => type === action || quickActions.includes(type)));
    };
};

// Submenu to configure the durations of the timeouts that can be applied from the reports
async function timeoutDurationsMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current durations
        const locale = getLocale();
        const timeoutDurations = [...(await client.functions.db.getConfig('moderation.reports.timeoutDurations') || [])];

        // Shows the explanation header and the current durations
        console.log(`🔇 ${locale.prompts.timeoutDurationsHeader}.\n`);
        console.log(timeoutDurations.length > 0 ? timeoutDurations.map(duration => `  • ${client.functions.utils.formatDuration(duration)}`).join('\n') + '\n' : `  ${getSharedLocale().emptyList}\n`);

        // Generates the choices (up to 25 durations, the limit of Discord for a select menu)
        const choices = [];
        if (timeoutDurations.length < 25) choices.push({ name: `➕ ${locale.prompts.addDuration}`, value: 'add' });
        if (timeoutDurations.length > 0) choices.push({ name: `➖ ${locale.prompts.removeDuration}`, value: 'remove' });
        choices.push({ name: `↩️  ${getSharedLocale().return}`, value: 'return' });

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: choices
        });

        // If the user wants to return, returns to the reports menu
        if (action === 'return') return;

        // If the user wants to add a duration
        if (action === 'add') {

            // Asks for the duration in minutes (up to 28 days minus a minute, as Discord does not allow longer timeouts), and adds it if it was not already on the list (sorting them)
            const minutes = await askNumber(locale.prompts.enterDuration, undefined, 1, 40319);
            if (!timeoutDurations.includes(minutes * 60000)) await client.functions.db.setConfig('moderation.reports.timeoutDurations', [...timeoutDurations, minutes * 60000].sort((a, b) => a - b));

        // If the user wants to remove a duration
        } else {

            // Asks for the duration to remove, and removes it if one was selected
            const duration = await select({
                message: `${locale.prompts.selectDurationToRemove}:`,
                choices: [...timeoutDurations.map(duration => ({ name: client.functions.utils.formatDuration(duration), value: duration })), { name: `↩️  ${getSharedLocale().return}`, value: 'return' }]
            });
            if (duration !== 'return') await client.functions.db.setConfig('moderation.reports.timeoutDurations', timeoutDurations.filter(otherDuration => otherDuration !== duration));
        };
    };
};

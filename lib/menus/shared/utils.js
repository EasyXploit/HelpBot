// Imports the necessary libraries
import { select, input } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Function to get the translations shared by the menus
export function getSharedLocale() {
    return client.locale.lib.menus.shared;
};

// Function to clear the console
export async function clearConsole() {
    // Cleans the console and shows the logo
    process.stdout.write('\u001b[2J\u001b[0;0H');
    await splashLogo(client.locale.lib.loaders.splashLogo);
};

// Function to wait some seconds, so the user can read a message
export async function wait(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

// Function to get the text that shows a status
export function getStatusText(enabled) {
    return enabled ? `🟢 ${client.locale.status.enabled}` : `🔴 ${client.locale.status.disabled}`;
};

// Function to get the text that shows a role (its name, or its ID if it could not be found)
export function getRoleText(roleId) {
    const role = client.baseGuild.roles.cache.get(roleId);
    return role ? `@${role.name}` : `ID: ${roleId}`;
};

// Function to get the text that shows a channel (its name, or its ID if it could not be found)
export function getChannelText(channelId) {
    const channel = client.baseGuild.channels.cache.get(channelId);
    return channel ? `#${channel.name}` : `ID: ${channelId}`;
};

// Function to ask for a yes or no confirmation
export async function confirm(message) {
    const locale = getSharedLocale();
    return await select({
        message: message,
        choices: [
            { name: `✅ ${locale.yes}`, value: true },
            { name: `❌ ${locale.no}`, value: false }
        ]
    });
};

// Function to ask for a whole number between a minimum and a maximum (or the current value, if nothing is written)
export async function askNumber(message, currentValue, minimum, maximum = Infinity) {
    const locale = getSharedLocale();
    const value = await input({
        message: `${message}:`,
        default: currentValue !== undefined ? currentValue.toString() : undefined,
        validate: v => /^\d+$/.test(v.trim()) && parseInt(v) >= minimum && parseInt(v) <= maximum ? true : (maximum === Infinity ? locale.invalidMinimum : locale.invalidNumber).replace('{{minimum}}', minimum).replace('{{maximum}}', maximum)
    });
    return parseInt(value);
};

// Function to choose a role of the guild (excluding @everyone and the roles managed by integrations), that returns its ID (or null if no role was chosen)
export async function selectRole() {

    // Stores the translations
    const locale = getSharedLocale();

    // Asks for the search method
    const searchMethod = await select({
        message: `${locale.selectSearchMethod}:`,
        choices: [
            { name: locale.searchRoleByName, value: 'name' },
            { name: locale.enterRoleIdManually, value: 'id' },
            { name: `↩️  ${locale.return}`, value: 'return' }
        ]
    });

    // If the user wants to return, aborts
    if (searchMethod === 'return') return null;

    // Fetches all roles in the guild, and filters the valid ones
    const roles = (await client.baseGuild.roles.fetch()).filter(role => role.id !== client.baseGuild.id && !role.managed);

    // If search method is by name
    if (searchMethod === 'name') {

        // Asks for the name to search
        const query = await input({ message: `${locale.enterRoleNameSearch}:` });

        // Filters the roles by name
        const filtered = roles.filter(role => role.name.toLowerCase().includes(query.toLowerCase()));

        // If no roles were found
        if (filtered.size === 0) {
            console.log(`\n🔴 ${locale.noRolesFound}.`);
            await wait(2);
            return null;
        };

        // Shows the found roles
        const selected = await select({
            message: `${locale.selectRole}:`,
            choices: [...filtered.map(role => ({ name: `@${role.name} - ${role.id}`, value: role.id })).slice(0, 25), { name: `↩️  ${locale.return}`, value: 'return' }]
        });

        // Returns the chosen role, or that no role was chosen
        return selected === 'return' ? null : selected;
    };

    // Asks for the ID of the role
    const roleId = (await input({
        message: `${locale.enterRoleId}:`,
        validate: v => v.trim().length > 0 ? true : locale.emptyValue
    })).trim();

    // If the role does not exist or is not valid
    if (!roles.has(roleId)) {
        console.log(`\n🔴 ${locale.roleNotFound}.`);
        await wait(2);
        return null;
    };

    // Returns the chosen role
    return roleId;
};

// Function to choose a channel of the guild, of the provided types (text channels by default), that returns its ID (or null if no channel was chosen)
export async function selectChannel(validTypes = [discord.ChannelType.GuildText]) {

    // Stores the translations
    const locale = getSharedLocale();

    // Asks for the search method
    const searchMethod = await select({
        message: `${locale.selectSearchMethod}:`,
        choices: [
            { name: locale.searchChannelByName, value: 'name' },
            { name: locale.enterChannelIdManually, value: 'id' },
            { name: `↩️  ${locale.return}`, value: 'return' }
        ]
    });

    // If the user wants to return, aborts
    if (searchMethod === 'return') return null;

    // Fetches all channels in the guild, and filters the ones of the valid types
    const channels = (await client.baseGuild.channels.fetch()).filter(channel => channel && validTypes.includes(channel.type));

    // If search method is by name
    if (searchMethod === 'name') {

        // Asks for the name to search
        const query = await input({ message: `${locale.enterChannelNameSearch}:` });

        // Filters the channels by name
        const filtered = channels.filter(channel => channel.name.toLowerCase().includes(query.toLowerCase()));

        // If no channels were found
        if (filtered.size === 0) {
            console.log(`\n🔴 ${locale.noChannelsFound}.`);
            await wait(2);
            return null;
        };

        // Shows the found channels
        const selected = await select({
            message: `${locale.selectChannel}:`,
            choices: [...filtered.map(channel => ({ name: `#${channel.name} - ${channel.id}`, value: channel.id })).slice(0, 25), { name: `↩️  ${locale.return}`, value: 'return' }]
        });

        // Returns the chosen channel, or that no channel was chosen
        return selected === 'return' ? null : selected;
    };

    // Asks for the ID of the channel
    const channelId = (await input({
        message: `${locale.enterChannelId}:`,
        validate: v => v.trim().length > 0 ? true : locale.emptyValue
    })).trim();

    // If the channel does not exist or is not valid
    if (!channels.has(channelId)) {
        console.log(`\n🔴 ${locale.noChannelsFound}.`);
        await wait(2);
        return null;
    };

    // Returns the chosen channel
    return channelId;
};

// Function to enable or disable a command, in the database and in the loaded commands (there is no need to reload all of them, as the disabled commands remain registered in Discord)
export async function setCommandStatus(commandType, fileName, enabled) {

    // Updates the status of the command in the database
    await client.functions.db.setConfig(`commands.${commandType}.${fileName}.enabled`, enabled);

    // Updates the status of the loaded command, if it is loaded
    if (client.commands && client.commands[commandType]) client.commands[commandType].filter(command => command.fileName === fileName).forEach(command => command.userConfig.enabled = enabled);
};

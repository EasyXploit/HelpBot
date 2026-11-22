// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { getSharedLocale, clearConsole, getStatusText } from '../../shared/utils.js';
import { getLocale, offerResettingAbsent, offerResettingAll } from './utils.js';

// Submenu to configure the statistics
export default async function statisticsMenu() {

    // Loops while the user does not return
    while (true) {

        // Clears the console
        await clearConsole();

        // Stores the translations and the current settings
        const locale = getLocale().statisticsMenu;
        const leveling = await client.functions.db.getConfig('leveling');

        // Shows the explanation header
        console.log(`📊 ${locale.headerMessage}.\n`);

        // Shows the select menu
        const action = await select({
            message: `${getSharedLocale().promptMessage}:`,
            choices: [
                { name: `💬 ${locale.choices.collectMessagesCount}: ${getStatusText(leveling.collectMessagesCount)}`, value: 'collectMessagesCount' },
                { name: `🎙️  ${locale.choices.collectVoiceTime}: ${getStatusText(leveling.collectVoiceTime)}`, value: 'collectVoiceTime' },
                { name: `💾 ${locale.choices.preserveStats}: ${getStatusText(leveling.preserveStats)}`, value: 'preserveStats' },
                { name: `🧹 ${locale.choices.resetMessagesCount}`, value: 'resetMessagesCount' },
                { name: `🧹 ${locale.choices.resetVoiceTime}`, value: 'resetVoiceTime' },
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

            // If the user wants to enable or disable the collection of a statistic
            case 'collectMessagesCount':
            case 'collectVoiceTime':
                await client.functions.db.setConfig(`leveling.${action}`, !leveling[action]);
                break;

            // If the user wants to change whether the statistics of the members who leave are preserved
            case 'preserveStats':

                // Changes the setting
                await client.functions.db.setConfig('leveling.preserveStats', !leveling.preserveStats);

                // If it has been disabled, offers to reset the statistics of the members that are no longer in the guild
                if (leveling.preserveStats) await offerResettingAbsent(['aproxVoiceTime', 'messagesCount'], locale.resetAbsent);
                break;

            // If the user wants to reset the sent messages of all the members
            case 'resetMessagesCount':
                await offerResettingAll(['messagesCount'], locale.resetAll.messagesCount);
                break;

            // If the user wants to reset the voice time of all the members
            case 'resetVoiceTime':
                await offerResettingAll(['aproxVoiceTime'], locale.resetAll.aproxVoiceTime);
                break;
        };
    };
};

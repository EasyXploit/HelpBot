// Imports the necessary libraries
import { select } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';
import Table from 'cli-table3';

// Stores the name of the menu
const menuName = new URL(import.meta.url).pathname.split('/').pop().replace('.js', '');

// Stores the translations of the bot
const locale = client.locale.lib.menus[menuName];

// Exports a default function
export default async (beforeError) => {

    try {

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
    
        // Shows an error message if one occurred
        if (beforeError) console.log(`❌ ${locale.errorMessage}.\n`);
        if (beforeError && process.env.NODE_ENV !== 'production') logger.error(`${beforeError.stack}\n`);
    
        // Creates a table for the information about the bot
        const botInfoTable = new Table({
            head: [
                {
                    content: locale.appInfo.header,
                    colSpan: 2
                }
            ],
            colWidths: [30, 40],
        });

        // Loads the repository configuration
        const packageConfig = require('./package.json');

        // Stores the local configuration from the configuration file
        const localConfig = require('./config.json');

        // Loads the target language from the environment variables, or from the local configuration
        let currentLocale = process.env.LOCALE && process.env.LOCALE.length > 0 ? process.env.LOCALE : localConfig.locale;
    
        // Adds rows to the information about the bot table
        botInfoTable.push(
            [ locale.appInfo.appVersion, packageConfig.version ],
            [ locale.appInfo.appAuthor, packageConfig.author ],
            [ locale.appInfo.license, packageConfig.license ],
            [ locale.appInfo.appName, client.user.username],
            [ locale.appInfo.appId, client.user.id ],
            [ locale.appInfo.language, currentLocale ],
            [ locale.appInfo.uptime, await client.functions.utils.msToTime(client.uptime) ],
            [ locale.appInfo.connectionStatus, client.user.presence.status ],
            [ locale.appInfo.activityType, client.user.presence.activities[0].type ],
            [ locale.appInfo.activityName, client.user.presence.activities[0].name ]
        );
    
        // Displays the information about the bot table
        console.log(botInfoTable.toString());
    
        // Creates a table for the information about the managed guild
        const homeGuildTable = new Table({
            head: [
                {
                    content: locale.guildInfo.header,
                    colSpan: 2
                }
            ],
            colWidths: [30, 40],
        });

        // Stores the members of the managed guild
        const managedGuildMembers = await client.baseGuild.members.fetch();
    
        // Adds rows to the managed guild table
        homeGuildTable.push(
            [ locale.guildInfo.guildName, client.baseGuild.name ],
            [ locale.guildInfo.guildId, client.baseGuild.id ],
            [ locale.guildInfo.availability, client.baseGuild.available ? locale.guildInfo.guildAvailable : locale.guildInfo.guildNotAvailable ],
            [ locale.guildInfo.totalMembers, managedGuildMembers.size ],
            [ locale.guildInfo.onlineMembers, managedGuildMembers.filter(member => member.presence && member.presence.status !== 'offline').size ], 
            [ locale.guildInfo.humanMembers, managedGuildMembers.filter(member => member.presence && !member.user.bot).size ],
            [ locale.guildInfo.botMembers, managedGuildMembers.filter(member => member.presence && member.user.bot).size ]
        );

        // Displays the information about the managed guild table
        console.log(homeGuildTable.toString());
    
        // Creates a table for the information about the databases
        const databasesTable = new Table({
            head: [
                {
                    content: locale.databasesInfo.header,
                    colSpan: 2
                }
            ],
            colWidths: [30, 40],
        });

        // Gets and processes the data from the database
        const profilesData = await client.functions.db.getData('profile');
        const totalMessages = profilesData.reduce((total, profile) => total + profile.stats.messagesCount, 0);
        const totalVoiceTime = profilesData.reduce((total, profile) => total + profile.stats.aproxVoiceTime, 0);
        const parsedTotalVoiceTime = totalVoiceTime > 0 ? `${await client.functions.utils.msToTime(totalVoiceTime)}` : '00:00:00';
        const totalExperience = profilesData.reduce((total, profile) => total + profile.stats.experience, 0);
        const totalWarns = profilesData.reduce((total, profile) => total + profile.moderationLog.warnsHistory.length, 0);
        const totalBans = client.baseGuild.bans.cache.size;
        const totalTimeouts = (await client.functions.db.getData('timeout')).length;
        const totalPolls = (await client.functions.db.getData('poll')).length;
        const scheduledMessagesData = await client.functions.db.getConfig('scheduledMessages.configuredMessages');
    
        // Adds rows to the information about the databases table
        databasesTable.push(
            [ locale.databasesInfo.storedProfiles, profilesData.length ],
            [ locale.databasesInfo.totalMessages, totalMessages ],
            [ locale.databasesInfo.totalVoice, parsedTotalVoiceTime ],
            [ locale.databasesInfo.totalExperience, totalExperience ],
            [ locale.databasesInfo.totalWarns, totalWarns ],
            [ locale.databasesInfo.totalBans, totalBans ],
            [ locale.databasesInfo.totalTimeouts, totalTimeouts ],
            [ locale.databasesInfo.totalPolls, totalPolls ],
            [ locale.databasesInfo.totalScheduledMessages, scheduledMessagesData ? scheduledMessagesData.length : 0 ]
        );
    
        // Displays the information about the databases table
        console.log(databasesTable.toString());
    
        // Shows the select menu
        global.currentPrompt = select({
            message: `${locale.promptMessage}:`,
            choices: [
                {
                    name: `🔄 ${locale.choices.refresh}`,
                    value: 'refresh'
                },
                {
                    name: `↩️  ${locale.choices.return}`,
                    value: 'return'
                }
            ],
        });
    
        // When the user selects an option
        global.currentPrompt.then(async (result) => {
    
            // When the user selects an option
            switch (result) {
    
                // If the user wants to refresh the menu
                case 'refresh':
                    
                    // Shows the information menu again
                    await client.functions.menus.information();
    
                    // Breaks the switch
                    break;
    
                // If the user wants to go back to the main menu
                case 'return':
                    
                    // Shows the main menu
                    await client.functions.menus.main();
    
                    // Breaks the switch
                    break;
            };

        // When an error occurs
        }).catch(async (error) => {
        
            // Runs this menu again, passing the error
            await client.functions.menus[menuName](error);
        });

    } catch (error) {

        // Runs this menu again, passing the error
        await client.functions.menus[menuName](error);
    };
};

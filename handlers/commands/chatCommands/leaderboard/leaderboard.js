export async function run(interaction, commandConfig, locale) {

    try {

        // Stores all profiles of the members
        const memberProfiles = await client.functions.db.getData('profile');

        // Returns an error if there is no classification table
        if (!memberProfiles || memberProfiles.length === 0) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noLeaderboard}.`)
        ], ephemeral: true});

        // Stores the type of classification to be displayed, if provided
        const typeOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.type.name);
        const type = typeOption ? typeOption.value : 'experience';

        // Stores the entries of the leaderboard
        let entries = [];

        // Stores if the order must be inverted
        let invertedOrder = type === 'antiquity' ? true : false;

        // Postpones the bot's response
        await interaction.deferReply();

        // Stores the cache of the guild members
        const guildMembers = await client.baseGuild.members.fetch();

        // For each member in the profile database
        for (const memberProfile of memberProfiles) {

            // Looks for the member in the guild, passing cache to the function
            const member = await client.functions.utils.fetch('member', memberProfile.userId, null, guildMembers);

            // If the member was not in the guild and should not be shown, omits it
            if (commandConfig.hideNotPresent && !member) continue;

            // Omits if it is ancient classification and the member is no longer on the server
            if (type === 'antiquity' && !member) continue;
                
            // Uploads an entry to the array of entries
            entries.push({
                memberId: memberProfile.userId,
                memberTag: member ? `**${member.user.tag}**` : locale.unknownMember,
                experience: memberProfile.stats.experience,
                aproxVoiceTime: memberProfile.stats.aproxVoiceTime,
                messagesCount: memberProfile.stats.messagesCount,
                antiquity: member.joinedTimestamp,
                lvl: memberProfile.stats.level
            });
        };

        // Sorts the entries from greatest to minor
        function compare(a, b) {
            if (a[type] < b[type]) return invertedOrder ? -1 : 1;
            if (a[type] > b[type]) return invertedOrder ? 1 : -1;
            return 0;
        };

        // Compares and orders the entries array
        entries.sort(compare);

        // Stores the total pages
        const totalPages = Math.ceil(entries.length / 10);

        // Stores the page number to be displayed, if provided
        const providedactualPageOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.page.name);
        const providedactualPage = providedactualPageOption ? providedactualPageOption.value : null;

        // Stores the current page (if one is provided, that is chosen)
        let actualPage = providedactualPage && providedactualPage <= totalPages ? providedactualPage : 1;

        // Stores the last interaction of the command
        let latestInteraction;

        do {

            // Stores the first pages range index
            const fromRange = 10 * actualPage - 9;

            // Stores the last index of the page range
            const toRange = 10 * actualPage;

            // Stores the string for description
            let board = '';

            // For each specified range index
            for (let index = fromRange - 1; index < toRange; index++) {

                // Stores the iterated entry
                const entry = entries[index];

                // If there are no more entries left, aborts the loop
                if (!entry) break;

                // Depending on the type provided
                switch (type) {

                    // If wanted to show the experience table
                    case 'experience':

                        // Generates the experience table
                        board += `\n**#${index + 1}** • \`${entry.experience} ${locale.embed.board.experience}\` • \`${locale.embed.board.level} ${entry.lvl}\` • ${entry.memberTag}`;
                        
                        // Stops the switch
                        break;
                
                    // If wanted to show the voice time
                    case 'aproxVoiceTime':

                        // Generates the voice time table
                        board += `\n**#${index + 1}** • \`${await client.functions.utils.msToTime(entry.aproxVoiceTime)}\` • ${entry.memberTag}`;
                        
                        // Stops the switch
                        break;
                
                    // If wanted to show the table of messages sent
                    case 'messagesCount':

                        // Generates the table of messages sent
                        board += `\n**#${index + 1}** • \`${entry.messagesCount} ${locale.embed.board.messagesCount}\` • ${entry.memberTag}`;
                        
                        // Stops the switch
                        break;
                
                    // If wanted to show the seniority table
                    case 'antiquity':

                        // Generates the seniority table
                        board += `\n**#${index + 1}** • \`${await client.functions.utils.msToTime(Date.now() - entry.antiquity)}\` • ${entry.memberTag}`;
                        
                        // Stops the switch
                        break;
                };
            };

            // Generates an Embed as a page
            const newPageEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setTitle(`:trophy: ${locale.embed.title[type]}`)
                .setDescription(board)
                .setFooter({ text: await client.functions.utils.parseLocale(locale.embed.footer, { actualPage: actualPage, totalPages: totalPages }), iconURL: client.baseGuild.iconURL({dynamic: true}) });

            // Invokes the button navigation manager
            const buttonNavigationResult = await client.functions.managers.buttonNavigation(interaction, 'leaderboard', actualPage, totalPages, newPageEmbed, latestInteraction, null);

            // Stores the last interaction
            latestInteraction = buttonNavigationResult.latestInteraction;

            // Stores the new current page
            actualPage = buttonNavigationResult.newActualPage;

        // As long as it should not be aborted by inactivity, the loop will continue
        } while (actualPage !== false);

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'type',
                type: discord.ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    {
                        choiceName: 'experience',
                        value: 'experience'
                    },
                    {
                        choiceName: 'aproxVoiceTime',
                        value: 'aproxVoiceTime'
                    },
                    {
                        choiceName: 'messagesCount',
                        value: 'messagesCount'
                    },
                    {
                        choiceName: 'antiquity',
                        value: 'antiquity'
                    }
                ]
            },
            {
                optionName: 'page',
                type: discord.ApplicationCommandOptionType.Integer,
                minValue: 1,
                required: false
            }
        ]
    }
};

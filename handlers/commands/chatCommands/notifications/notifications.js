export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores if the member can win XP
        const notAuthorizedToEarnXp = await client.functions.utils.checkAuthorization(interaction.member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

        // If the member is not authorized to do so, returns an error message
        if (notAuthorizedToEarnXp) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores the selected modality
        const modality = interaction.options.get(locale.appData.options.modality.name).value;

        // Stores the selected state
        const status = interaction.options.get(locale.appData.options.status.name).value;

        // Stores the member's profile, or creates it
        let memberProfile = await client.functions.db.getData('profile', interaction.member.id) || await client.functions.db.genData('profile', { userId: interaction.member.id });

        // Stores member notification settings
        const memberSettings = memberProfile.notifications;

        // If wanted to activate a notification
        if (status === 'enabled') {

            // If it was already activated, it notifies the error
            if (memberSettings[modality]) return interaction.reply({embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyEnabled}.`)
            ], flags: discord.MessageFlags.Ephemeral});

            // Activates the adjustment
            memberSettings[modality] = true;

        // If wanted to deactivate a notification
        } else if (status === 'disabled') {

            // If it was already disabled, notifies the error
            if (!memberSettings[modality]) return interaction.reply({embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyDisabled}.`)
            ], flags: discord.MessageFlags.Ephemeral});

            // Disables the adjustment
            memberSettings[modality] = false;
        };

        // Keeps the new statistics of the member in the database
        await client.functions.db.setData('profile', interaction.member.id, memberProfile);

        // Notifies the result of the action
        interaction.reply({embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setDescription(`${client.customEmojis.greenTick} ${locale[`${modality}${status.charAt(0).toUpperCase()}${status.slice(1)}`]}.`)
        ], flags: discord.MessageFlags.Ephemeral})
        
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
                optionName: 'modality',
                type: discord.ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        choiceName: 'public',
                        value: 'public'
                    },
                    {
                        choiceName: 'private',
                        value: 'private'
                    }
                ]
            },
            {
                optionName: 'status',
                type: discord.ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        choiceName: 'enabled',
                        value: 'enabled'
                    },
                    {
                        choiceName: 'disabled',
                        value: 'disabled'
                    }
                ]
            }
        ]
    }
};

export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores if the member can win XP
        const notAuthorizedToEarnXp = await client.functions.utils.checkAuthorization(interaction.member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

        // If the member is not authorized to do so, returns an error message
        if (notAuthorizedToEarnXp) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], ephemeral: true});

        // Stores the selected modality
        const modality = interaction.options._hoistedOptions[0].value;

        // Stores the selected state
        const status = interaction.options._hoistedOptions[1].value;

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
            ], ephemeral: true});

            // Activates the adjustment
            memberSettings[modality] = true;

        // If wanted to deactivate a notification
        } else if (status === 'disabled') {

            // If it was already disabled, notifies the error
            if (!memberSettings[modality]) return interaction.reply({embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyDisabled}.`)
            ], ephemeral: true});

            // Disables the adjustment
            memberSettings[modality] = false;
        };

        // Keeps the new statistics of the member in the database
        await client.functions.db.setData('profile', interaction.member.id, memberProfile);

        // Notifies the result of the action
        interaction.reply({embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setDescription(`${client.customEmojis.greenTick} ${locale[`${modality}${status.charAt(0).toUpperCase()}${status.slice(1)}`]}.`)
        ], ephemeral: true})
        
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

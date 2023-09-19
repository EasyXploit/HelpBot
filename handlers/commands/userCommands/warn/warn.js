export async function run(interaction, commandConfig, locale) {

    try {

        // Looks for the target member
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        // Returns an error if the member has not been found
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        // Returns an error if a bot has been provided
        if (member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        // It is checked if the role of the executing member is lower than that of the target member
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});
        
        // Stores the member's profile
        const memberProfile = await client.functions.db.getData('profile', member.id);

        // Stores the member warnings
        const memberWarns = memberProfile ? memberProfile.moderationLog.warnsHistory : null;

        // If the member had previous warnings and the executor is not the guild owner
        if (memberWarns && interaction.member.id !== interaction.guild.ownerId) {

            // Stores the last warn of the member
            const latestWarn = memberWarns[memberWarns.length - 1];

            // If the minimum time has not passed between warnings
            if (Date.now() - latestWarn.timestamp < commandConfig.minimumTimeDifference) {

                // Stores if the member can skip the minimum interval
                const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedFrequency});

                // If the member is not authorized, returns an error message
                if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.cooldown, { member: member })}.`)
                ], ephemeral: true});
            };
        };

        // Generates a new modal
        const reasonModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('warnReason');

        // Generates the only row of the modal
        const bodyRow = new discord.ActionRowBuilder().addComponents(

            // Adds a text field to the row
            new discord.TextInputBuilder()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle(discord.TextInputStyle.Paragraph)
                .setRequired(true)
        );

        // Attaches the components to the modal
        reasonModal.addComponents([bodyRow]);

        // Shows the modal to the user
        await interaction.showModal(reasonModal);

        // Creates a filter to get the expected modal
        const modalsFilter = (interaction) => interaction.customId === 'warnReason';

        // Waits for the modal to be filled
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Stores the body field
            const obtainedReason = modalInteraction.fields.getField('body').value;

            // Executes the infractions handler
            await client.functions.moderation.manageWarn(member, obtainedReason, 2, interaction.user, null, modalInteraction, interaction.channel);
            
        }).catch(() => { null; });

        // Aborts if a reason was not provided in the expected time
        if (!reason) return;

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
    defaultMemberPermissions: new discord.PermissionsBitField('ModerateMembers'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.User
    }
};

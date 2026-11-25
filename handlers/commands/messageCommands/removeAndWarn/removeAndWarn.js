export async function run(interaction, commandConfig, locale) {

    try {

        // If the executor has no permissions to erase messages, sends an error
        const missingPermissions = await client.functions.utils.missingPermissions(interaction.channel, interaction.member, ['ManageMessages'])
        if (missingPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantDeleteMessages}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Looks for the target member
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].message.author.id);

        // Returns an error if the member has not been found
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Returns an error if a bot has been provided
        if (member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], flags: discord.MessageFlags.Ephemeral});
        
        // It is checked if the role of the executing member is lower than that of the target member
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], flags: discord.MessageFlags.Ephemeral});
        
        // Stores the member's profile
        const memberProfile = await client.functions.db.getData('profile', member.id);

        // Stores the member warnings
        const memberWarns = memberProfile ? memberProfile.moderationLog.warnsHistory : null;

        // If the member had previous warnings and the executor is not the guild owner
        if (memberWarns && memberWarns.length > 0 && interaction.member.id !== interaction.guild.ownerId) {

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
                ], flags: discord.MessageFlags.Ephemeral});
            };
        };

        // Generates a new modal
        const reasonModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('removeAndWarnReason');

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
        const modalsFilter = (interaction) => interaction.customId === 'removeAndWarnReason';

        // Waits for the modal to be filled
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Sends a confirmation message
            await modalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.correct}`)
            ], flags: discord.MessageFlags.Ephemeral});

            // Returns the field of the body
            return modalInteraction.fields.getField('body').value;
            
        }).catch(error => {

            // Returns nothing if the modal was not submitted in time, or throws the error so the error handler logs it
            if (error.code === 'InteractionCollectorError') return null;
            throw error;
        });

        // Aborts if a reason was not provided in the expected time
        if (!reason) return;

        // Stores the warned message
        const warnedMessage = interaction.options._hoistedOptions[0].message;

        // Executes the infractions handler
        await client.functions.moderation.manageWarn(member, reason, 3, interaction.user, warnedMessage, null, warnedMessage.channel);

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis', 'ManageMessages']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('ModerateMembers'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.Message
    }
};

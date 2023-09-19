export async function run(interaction, commandConfig, locale) {

    try {

        // Looks for the target member
        const reportedMember = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].message.author.id);

        // Returns an error if the member has not been found
        if (!reportedMember) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        // Returns an error if the member has tried to report himself
        if (reportedMember.id === interaction.member.id) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantReportYourself}.`)
        ], ephemeral: true});

        // Generates a new modal
        const reasonModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('reportMessageReason');

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
        const modalsFilter = (interaction) => interaction.customId === 'reportMessageReason';

        // Waits for the modal to be filled
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Obtains the field of the body
            const reportReason = modalInteraction.fields.getField('body').value;

            // Executes the reports manager
            await client.functions.managers.sendReport(interaction, modalInteraction, reportReason, reportedMember);
            
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
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.Message
    }
};

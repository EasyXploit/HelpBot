export async function run(interaction, commandConfig, locale) {

    try {

        // Stores the author of the reported message
        const messageAuthor = interaction.options._hoistedOptions[0].message.author;

        // Looks for the target member or, if it is no longer in the guild, uses its user to be able to report it anyway
        const reportedMember = await client.functions.utils.fetch('member', messageAuthor.id) || messageAuthor;

        // Returns an error if the member has not been found
        if (!reportedMember) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Returns an error if the member has tried to report himself
        if (reportedMember.id === interaction.member.id) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantReportYourself}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Generates a new modal
        const reasonModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId(`reportMessageReason:${interaction.id}`);

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
        const modalsFilter = (modalInteraction) => modalInteraction.customId === `reportMessageReason:${interaction.id}`;

        // Waits for the modal to be filled
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Acknowledges the modal at once, as sending the report can take longer than Discord allows to respond
            await modalInteraction.deferReply({ flags: discord.MessageFlags.Ephemeral });

            // Obtains the field of the body
            const reportReason = modalInteraction.fields.getField('body').value;

            // Executes the reports manager
            await client.functions.reports.sendReport(interaction, modalInteraction, reportReason, reportedMember);
            
        }).catch(error => {

            // Returns nothing if the modal was not submitted in time, or throws the error so the error handler logs it
            if (error.code === 'InteractionCollectorError') return null;
            throw error;
        });

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
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.Message
    }
};

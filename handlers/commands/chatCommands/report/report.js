export async function run(interaction, commandConfig, locale) {

    try {

        // Stores the reported member if it is provided as parameter
        const reportedMemberOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.member.name);
        const reportedMember = reportedMemberOption ? await client.functions.utils.fetch('member', reportedMemberOption.value) : null;

        // Stores the report if it is provided as parameter
        const reportOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.body.name);

        // Executes the report handler if the report has been provided as a parameter
        if (reportOption) return await client.functions.managers.sendReport(interaction, null, reportOption.value, reportedMember);

        // Generates a new modal
        const reasonModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('reportReason');

        // Generates the only modal row
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
        const modalsFilter = (interaction) => interaction.customId === 'reportReason';

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
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'body',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            },
            
            {
                optionName: 'member',
                type: discord.ApplicationCommandOptionType.User,
                required: false
            }
        ]
    }
};

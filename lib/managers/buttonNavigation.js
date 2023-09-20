// Function to manage navigation menus in embeds
export default async (interaction, customId, actualPage, totalPages, generatedPageMessage, latestInteraction, attachedFiles) => {

    // Stores the translations
    const locale = client.locale.lib.managers.buttonNavigation;

    // Stores the new current page
    let newActualPage = actualPage;

    // Stores the interaction response
    let response = { embeds: [generatedPageMessage], fetchReply: true };

    // If files must be attached, it does so
    if (attachedFiles) response.files = attachedFiles;

    // Adds buttons if necessary
    if (totalPages > 1) {

        // Fills in the message components
        response.components = [
            
            // Generates a new row of buttons
            new discord.ActionRowBuilder().addComponents([
            
                // Generates the button to return to the beginning
                new discord.ButtonBuilder()
                    .setStyle(discord.ButtonStyle.Secondary)
                    .setDisabled(actualPage > 1 ? false : true)
                    .setEmoji('⏮')
                    .setCustomId(`firstPage-${customId}`),

                // Generates the back button
                new discord.ButtonBuilder()
                    .setStyle(discord.ButtonStyle.Secondary)
                    .setDisabled(actualPage > 1 ? false : true)
                    .setEmoji('◀')
                    .setCustomId(`previousPage-${customId}`),

                // Generates the advance button
                new discord.ButtonBuilder()
                    .setStyle(discord.ButtonStyle.Secondary)
                    .setDisabled(actualPage < totalPages ? false : true)
                    .setEmoji('▶')
                    .setCustomId(`nextPage-${customId}`),

                // Generates the go to the end button
                new discord.ButtonBuilder()
                    .setStyle(discord.ButtonStyle.Secondary)
                    .setDisabled(actualPage < totalPages ? false : true)
                    .setEmoji('⏭')
                    .setCustomId(`lastPage-${customId}`)
            ])
        ]
    };

    // Stores the menu message
    let navigationMenuMessage;

    // Sends or updates the message
    if (latestInteraction) {

        // Updates the previously sent message
        await latestInteraction.update(response);

        // Stores the menu message
        navigationMenuMessage = latestInteraction.message;

    } else {

        try {

            // Sends the message for the first time and stores it
            navigationMenuMessage = await interaction.reply(response);

        } catch (error) {

            // If the error is due to the fact that the message was deferred
            if (error.toString().includes('The reply to this interaction has already been sent or deferred')) {

                // Edits the deferred answer with the message and stores it
                navigationMenuMessage = await interaction.editReply(response);
            };
        };
    };

    // If there is only one page, aborts the rest of the code because it is not necessary to navigate
    if (totalPages === 1) return {newActualPage: false, latestInteraction: false};

    // Generates a buttons filter
    const buttonsFilter = async (buttonInteraction) => {

        // If the button was pressed by the command executor, triggers the filter
        if (buttonInteraction.member.id === interaction.member.id) return true;

        // If the button was not pressed by the command executor, returns an error
        return buttonInteraction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantUseNavigation}.`)
        ], ephemeral: true});
    };

    // Waits button pulsations in the message
    await navigationMenuMessage.awaitMessageComponent({ filter: buttonsFilter, time: 60000  }).then(async buttonInteraction => {

        // Stores the Id of the pressed button
        const pressedButtonId = buttonInteraction.customId;

        // According to the selected button, updates the position count
        if (pressedButtonId === `firstPage-${customId}`) newActualPage = 1;
        if (pressedButtonId === `previousPage-${customId}`) newActualPage = actualPage - 1;
        if (pressedButtonId === `nextPage-${customId}`) newActualPage = actualPage + 1;
        if (pressedButtonId === `lastPage-${customId}`) newActualPage = totalPages;

        // Stores the latest related interaction received
        latestInteraction = buttonInteraction;

    // If it has not been pressed in the expected time
    }).catch(async error => {

        // If it is not an error by deletion of the message
        if (!error.toString().includes('messageDelete')) {

            // Deletes the buttons row
            await navigationMenuMessage.edit({ components: [] });
        };

        // Cancels the current page to abort possible loops
        return newActualPage = false;
    });

    // Returns the new state of the menu
    return {newActualPage: newActualPage, latestInteraction: latestInteraction};
};

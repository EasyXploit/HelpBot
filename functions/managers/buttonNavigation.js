//Función para gestionar la navegación por menús en los embeds
exports.run = async (client, interaction, customId, actualPage, totalPages, generatedPageMessage, latestInteraction) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.buttonNavigation;

    //Almacena la nueva página actual
    let newActualPage = actualPage;

    //Genera una nueva fila de botones
    const buttonsRow = new client.MessageActionRow().addComponents([
        
        //Genera el botón de volver al principio
        new client.MessageButton()
            .setStyle('SECONDARY')
            .setDisabled(actualPage > 1 ? false : true)
            .setEmoji('⏮')
            .setCustomId(`firstPage-${customId}`),

        //Genera el botón de retroceder
        new client.MessageButton()
            .setStyle('SECONDARY')
            .setDisabled(actualPage > 1 ? false : true)
            .setEmoji('◀')
            .setCustomId(`previousPage-${customId}`),

        //Genera el botón de avanzar
        new client.MessageButton()
            .setStyle('SECONDARY')
            .setDisabled(actualPage < totalPages ? false : true)
            .setEmoji('▶')
            .setCustomId(`nextPage-${customId}`),

        //Genera el botón de ir al final
        new client.MessageButton()
            .setStyle('SECONDARY')
            .setDisabled(actualPage < totalPages ? false : true)
            .setEmoji('⏭')
            .setCustomId(`lastPage-${customId}`)
    ]);

    //Envía o actualiza el mensaje
    if (latestInteraction) {

        //Actualiza el mensaje enviado anteriormente
        await latestInteraction.update({ embeds: [generatedPageMessage], components: [buttonsRow] });

    } else {

        //Envía el mensaje por primera vez y lo almacena
        newActualPageMessage = await interaction.reply({ embeds: [generatedPageMessage], components: [buttonsRow], fetchReply: true });
    };

    //Genera un filtro de botones
    const buttonsFilter = (buttonInteraction) => {

        //Si el botón fue pulsado por el ejecutor del comando, dispara el filtro
        if (buttonInteraction.member.id === interaction.member.id) return true;

        //Si el botón no fue pulsado por el ejecutor del comando, devuelve un error
        return buttonInteraction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantUseNavigation}.`)
        ], ephemeral: true});
    };

    //Espera pulsaciones de botón en el mensaje
    await newActualPageMessage.awaitMessageComponent({ filter: buttonsFilter, time: 60000, errors: ['time']  }).then(async buttonInteraction => {

        //Almacena el ID del botón pulsado
        const pressedButtonId = buttonInteraction.customId;

        //Según el botón seleccionado, actualiza el contador de posición
        if (pressedButtonId === `firstPage-${customId}`) newActualPage = 1;
        if (pressedButtonId === `previousPage-${customId}`) newActualPage = actualPage - 1;
        if (pressedButtonId === `nextPage-${customId}`) newActualPage = actualPage + 1;
        if (pressedButtonId === `lastPage-${customId}`) newActualPage = totalPages;

        //Almacena la última interacción relacionada recibida
        latestInteraction = buttonInteraction;

    //Si no se ha pulsado en el tiempo esperado
    }).catch(async () => {

        //Elimina la fila de botones
        await newActualPageMessage.edit({ components: [] });

        //Anula la página actual para abortar posibles bucles
        return newActualPage = false;
    });

    //Devuelve el nuevo estado del menú
    return {newActualPage: newActualPage, latestInteraction: latestInteraction};
};

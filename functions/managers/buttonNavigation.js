//Función para gestionar la navegación por menús en los embeds
exports.run = async (client, interaction, customId, actualPage, totalPages, generatedPageMessage, latestInteraction, attachedFiles) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.buttonNavigation;

    //Almacena la nueva página actual
    let newActualPage = actualPage;

    //Almacena la respuesta a la interacción
    let response = { embeds: [generatedPageMessage], fetchReply: true };

    //Si se deben adjuntar archivos, lo hace
    if (attachedFiles) response.files = attachedFiles;

    //Añade botones si es necesario
    if (totalPages > 1) {

        //Rellena los componentes del mensaje
        response.components = [
            
            //Genera una nueva fila de botones
            new client.MessageActionRow().addComponents([
            
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
            ])
        ]
    };

    //Almacena el mensaje del menú
    let navigationMenuMessage;

    //Envía o actualiza el mensaje
    if (latestInteraction) {

        //Actualiza el mensaje enviado anteriormente
        await latestInteraction.update(response);

        //Almacena el mensaje del menú
        navigationMenuMessage = latestInteraction.message;

    } else {

        try {

            //Envía el mensaje por primera vez y lo almacena (si )
            navigationMenuMessage = await interaction.reply(response);

        } catch (error) {

            //Si el error se debe a que el mensaje estaba deferido
            if (error.toString().includes('The reply to this interaction has already been sent or deferred')) {

                //Edita la respuesta deferida con el mensaje y lo almacena
                navigationMenuMessage = await interaction.editReply(response);
            };
        };
    };

    //Si solo hay una página, aborta el resto del código por que no hace falta navegación
    if (totalPages === 1) return {newActualPage: false, latestInteraction: false};

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
    await navigationMenuMessage.awaitMessageComponent({ filter: buttonsFilter, time: 60000  }).then(async buttonInteraction => {

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
    }).catch(async error => {

        //Si no es un error por borrado del mensaje
        if (!error.toString().includes('messageDelete')) {

            //Elimina la fila de botones
            await navigationMenuMessage.edit({ components: [] });
        };

        //Anula la página actual para abortar posibles bucles
        return newActualPage = false;
    });

    //Devuelve el nuevo estado del menú
    return {newActualPage: newActualPage, latestInteraction: latestInteraction};
};

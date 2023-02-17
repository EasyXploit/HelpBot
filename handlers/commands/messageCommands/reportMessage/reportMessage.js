exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Busca al miembro objetivo
        const reportedMember = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].message.author.id);

        //Devuelve un error si no se ha encontrado al miembro
        if (!reportedMember) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Devuelve un error si el meimbro ha intentado reportarse a sí mismo
        if (reportedMember.id === interaction.member.id) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantReportYourself}.`)
        ], ephemeral: true});

        //Genera un nuevo modal
        const reasonModal = new client.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('reportMessageReason');

        //Genera la única fila del modal
        const bodyRow = new client.MessageActionRow().addComponents(

            //Añade un campo de texto a la fila
            new client.TextInputComponent()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle('PARAGRAPH')
                .setRequired(true)
        );

        //Adjunta los componentes al modal
        reasonModal.addComponents([bodyRow]);

        //Muestra el modal al usuario
        await interaction.showModal(reasonModal);

        //Crea un filtro para obtener el modal esperado
        const modalsFilter = (interaction) => interaction.customId === 'reportMessageReason';

        //Espera a que se rellene el modal
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Obtiene el campo del cuerpo
            const reportReason = modalInteraction.fields.getField('body').value;

            //Ejecuta el manejador de reportes
            await client.functions.managers.report.run(client, interaction, modalInteraction, reportReason, reportedMember);
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó una razón en el tiempo esperado
        if (!reason) return;

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: false,
    dmPermission: false,
    appData: {
        type: 'MESSAGE'
    }
};

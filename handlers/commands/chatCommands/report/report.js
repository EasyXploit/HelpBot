export async function run(interaction, commandConfig, locale) {

    try {

        //Almacena el mimebro reportado si se proporciona cómo parámetro
        const reportedMemberOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.member.name);
        const reportedMember = reportedMemberOption ? await client.functions.utils.fetch('member', reportedMemberOption.value) : null;

        //Almacena el reporte si se proporciona cómo parámetro
        const reportOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.body.name);

        //Ejecuta el manejador de reportes si se ha proporcionado el reporte como parámetro
        if (reportOption) return await client.functions.managers.sendReport(interaction, null, reportOption.value, reportedMember);

        //Genera un nuevo modal
        const reasonModal = new discord.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('reportReason');

        //Genera la única fila del modal
        const bodyRow = new discord.MessageActionRow().addComponents(

            //Añade un campo de texto a la fila
            new discord.TextInputComponent()
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
        const modalsFilter = (interaction) => interaction.customId === 'reportReason';

        //Espera a que se rellene el modal
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Obtiene el campo del cuerpo
            const reportReason = modalInteraction.fields.getField('body').value;

            //Ejecuta el manejador de reportes
            await client.functions.managers.sendReport(interaction, modalInteraction, reportReason, reportedMember);
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó una razón en el tiempo esperado
        if (!reason) return;

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['USE_EXTERNAL_EMOJIS']
    },
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'body',
                type: 'STRING',
                required: false
            },
            
            {
                optionName: 'member',
                type: 'USER',
                required: false
            }
        ]
    }
};

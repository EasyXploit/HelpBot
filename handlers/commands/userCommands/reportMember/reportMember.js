export async function run(interaction, commandConfig, locale) {

    try {

        //Busca al miembro objetivo
        const reportedMember = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!reportedMember) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Devuelve un error si el meimbro ha intentado reportarse a sí mismo
        if (reportedMember.id === interaction.member.id) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantReportYourself}.`)
        ], ephemeral: true});

        //Genera un nuevo modal
        const reasonModal = new discord.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('reportMemberReason');

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
        const modalsFilter = (interaction) => interaction.customId === 'reportMemberReason';

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
    defaultMemberPermissions: new discord.Permissions('ADMINISTRATOR'),
    dmPermission: false,
    appData: {
        type: 'USER'
    }
};

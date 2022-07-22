exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {
            
        //Busca el canal en la guild
        const channel = interaction.options._hoistedOptions[1] ? await client.functions.utilities.fetch.run(client, 'channel', interaction.options._hoistedOptions[1].value) : null;

        //Devuelve un error si no se ha encontrado el canal
        if (interaction.options._hoistedOptions[1] && !channel) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noChannel, { id: interaction.options._hoistedOptions[1].value })}.`)
        ], ephemeral: true});
        
        //Busca el mensaje en el canal
        const msg = await client.functions.utilities.fetch.run(client, 'message', interaction.options._hoistedOptions[0].value, channel)
        if (!msg) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.msgNotFound, { msgId: interaction.options._hoistedOptions[0].value })}.`)
        ], ephemeral: true});

        //Comprueba si el mensaje es del bot
        if (msg.author.id !== client.user.id) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantEdit}.`)
        ], ephemeral: true});

        //Almacena el modo del mensaje a editar
        const type = msg.embeds.length > 0 ? 'embed' : 'normal';

        //Genera un nuevo modal
        const messageContentModal = new client.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('send-body');

        //Genera la única fila del modal
        const bodyRow = new client.MessageActionRow().addComponents(

            //Añade un campo de texto a la fila
            new client.TextInputComponent()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle('PARAGRAPH')
                .setMaxLength(type === 'normal' ? 2000: 4000)
                .setRequired(true)
        );

        //Adjunta los componentes al modal
        messageContentModal.addComponents([bodyRow]);

        //Muestra el modal al usuario
        await interaction.showModal(messageContentModal);

        //Crea un filtro para obtener el modal esperado
        const modalsFilter = (interaction) => interaction.customId === 'send-body';

        //Espera a que se rellene el modal
        const newContent = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Responde a la interacción con una confirmación
            await modalInteraction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.correctEmbed.title}`)
                .setDescription(`${locale.correctEmbed.description}.`)
            ], ephemeral: true});

            //Devuelve el campo del cuerpo
            return modalInteraction.fields.getField('body').value;
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó un cuerpo en el tiempo esperado
        if (!newContent) return;

        //Comprueba si ha de enviar un embed o un mensaje normal
        if (type === 'embed') {

            //Edita el embed con el nuevo contenido
            msg.edit({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setDescription(newContent)
            ]});

        } else if (type === 'normal') {

            //Edita el mensaje con el nuevo contenido
            await msg.edit({ content: newContent });
        };

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
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'id',
                type: 'STRING',
                required: true
            },
            {
                optionName: 'channel',
                type: 'CHANNEL',
                required: false
            }
        ]
    }
};

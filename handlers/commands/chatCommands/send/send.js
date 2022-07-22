exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Almacena el ID del canal proporcionado, o el del actual
        const destinationChannelId = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : interaction.channelId;
        const destinationChannel = await client.functions.utilities.fetch.run(client, 'channel', destinationChannelId);

        //Comprueba si el canal existe
        if (!destinationChannel || !['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_STORE', 'GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'].includes(destinationChannel.type)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidChannel}.`)
        ], ephemeral: true});

        //Comprueba si el miembro tiene permisos para ejecutar esta acción
        const memberPermissions = destinationChannel.permissionsFor(interaction.user).bitfield;
        if ((memberPermissions & BigInt(0x800)) !== BigInt(0x800)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noPermission, { channel: destinationChannel })}.`)
        ], ephemeral: true});

        //Almacena el modo seleccionado
        const type = interaction.options._hoistedOptions[0].value;

        //Genera un nuevo modal
        const messageContentModal = new client.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('edit-body');

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
        const modalsFilter = (interaction) => interaction.customId === 'edit-body';

        //Espera a que se rellene el modal
        const body = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Envía un mensaje de confirmación
            await modalInteraction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} ${locale.correct}`)
            ]});

            //Elimina la confirmación
            setTimeout(() => modalInteraction.deleteReply(), 3000);

            //Devuelve el campo del cuerpo
            return modalInteraction.fields.getField('body').value;
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó un cuerpo en el tiempo esperado
        if (!body) return;

        //Comprueba si ha de enviar un embed o un mensaje normal
        if (type === 'embed') {

            //Envía un embed con el mensaje
            await destinationChannel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setDescription(body)]
            });

        } else if (type === 'normal') {

            //Envía el mensaje en texto plano
            await destinationChannel.send({ content: body });
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
                optionName: 'type',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        choiceName: 'embed',
                        value: 'embed'
                    },
                    {
                        choiceName: 'normal',
                        value: 'normal'
                    }
                ]
            },
            {
                optionName: 'channel',
                type: 'CHANNEL',
                required: false
            }
        ]
    }
};

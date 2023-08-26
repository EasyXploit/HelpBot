export async function run(interaction, commandConfig, locale) {
    
    try {
            
        //Busca el canal en la guild
        const channel = await client.functions.utils.fetch('channel', interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : interaction.channelId);

        //Devuelve un error si no se ha encontrado el canal
        if (interaction.options._hoistedOptions[1] && !channel) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noChannel, { id: interaction.options._hoistedOptions[1].value })}.`)
        ], ephemeral: true});

        //Almacena si faltan permisos en el canal objetivo
        const missingPermissions = await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['ViewChannel', 'ReadMessageHistory']);
        if (missingPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noBotPermission, { channel: channel, missingPermissions: missingPermissions })}.`)
        ], ephemeral: true});
        
        //Busca el mensaje en el canal
        const msg = await client.functions.utils.fetch('message', interaction.options._hoistedOptions[0].value, channel);
        if (!msg) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.msgNotFound, { msgId: interaction.options._hoistedOptions[0].value })}.`)
        ], ephemeral: true});

        //Comprueba si el mensaje es del bot
        if (msg.author.id !== client.user.id) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantEdit}.`)
        ], ephemeral: true});

        //Almacena el modo del mensaje a editar
        const type = msg.embeds.length > 0 ? 'embed' : 'normal';

        //Genera un nuevo modal
        const messageContentModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('send-body');

        //Genera la única fila del modal
        const bodyRow = new discord.ActionRowBuilder().addComponents(

            //Añade un campo de texto a la fila
            new discord.TextInputBuilder()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle(discord.TextInputStyle.Paragraph)
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
            await modalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
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
            msg.edit({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setDescription(newContent)
            ]});

        } else if (type === 'normal') {

            //Edita el mensaje con el nuevo contenido
            await msg.edit({ content: newContent });
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'id',
                type: discord.ApplicationCommandOptionType.String,
                required: true
            },
            {
                optionName: 'channel',
                type: discord.ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
};

export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores the Id of the channel provided, or the current one
        const destinationChannelId = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : interaction.channelId;
        const destinationChannel = await client.functions.utils.fetch('channel', destinationChannelId);

        // Checks if the channel exists
        if (!destinationChannel || ![discord.ChannelType.GuildText, discord.ChannelType.GuildNews, discord.ChannelType.GuildNewsThread, discord.ChannelType.GuildPublicThread, discord.ChannelType.GuildPrivateThread].includes(destinationChannel.type)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidChannel}.`)
        ], ephemeral: true});

        // Checks if the member has permissions to execute this action
        const missingPermissions = await client.functions.utils.missingPermissions(destinationChannel, interaction.member, ['SendMessages'])
        if (missingPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noPermission, { channel: destinationChannel, missingPermissions: missingPermissions })}.`)
        ], ephemeral: true});

        // Stores the selected mode
        const type = interaction.options._hoistedOptions[0].value;

        // Generates a new modal
        const messageContentModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('edit-body');

        // Generates the only row of the modal
        const bodyRow = new discord.ActionRowBuilder().addComponents(

            // Adds a text field to the row
            new discord.TextInputBuilder()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle(discord.TextInputStyle.Paragraph)
                .setMaxLength(type === 'normal' ? 2000: 4000)
                .setRequired(true)
        );

        // Attaches the components to the modal
        messageContentModal.addComponents([bodyRow]);

        // Shows the modal to the user
        await interaction.showModal(messageContentModal);

        // Creates a filter to get the expected modal
        const modalsFilter = (interaction) => interaction.customId === 'edit-body';

        // Waits for the modal to be filled
        const body = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Sends a confirmation message
            await modalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.correct}`)
            ], ephemeral: true});

            // Returns the field of the body
            return modalInteraction.fields.getField('body').value;
            
        }).catch(() => { null; });

        // Aborts if a body was not provided in the expected time
        if (!body) return;

        // Checks if has to send an embed or a normal message
        if (type === 'embed') {

            // Sends an embed with the message
            await destinationChannel.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setDescription(body)]
            });

        } else if (type === 'normal') {

            // Sends the message in flat text
            await destinationChannel.send({ content: body });
        };

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
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'type',
                type: discord.ApplicationCommandOptionType.String,
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
                type: discord.ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
};

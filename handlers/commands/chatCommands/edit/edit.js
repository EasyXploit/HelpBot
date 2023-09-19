export async function run(interaction, commandConfig, locale) {
    
    try {
            
        // Looks for the channel in the guild
        const channel = await client.functions.utils.fetch('channel', interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : interaction.channelId);

        // Returns an error if the channel has not been found
        if (interaction.options._hoistedOptions[1] && !channel) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noChannel, { id: interaction.options._hoistedOptions[1].value })}.`)
        ], ephemeral: true});

        // Stores if permissions are missing on the target channel
        const missingPermissions = await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['ViewChannel', 'ReadMessageHistory']);
        if (missingPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noBotPermission, { channel: channel, missingPermissions: missingPermissions })}.`)
        ], ephemeral: true});
        
        // Looks for the message on the channel
        const msg = await client.functions.utils.fetch('message', interaction.options._hoistedOptions[0].value, channel);
        if (!msg) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.msgNotFound, { msgId: interaction.options._hoistedOptions[0].value })}.`)
        ], ephemeral: true});

        // Checks if the message is from the bot
        if (msg.author.id !== client.user.id) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantEdit}.`)
        ], ephemeral: true});

        // Stores the message to edit
        const type = msg.embeds.length > 0 ? 'embed' : 'normal';

        // Generates a new modal
        const messageContentModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('send-body');

        // Generates the only modal for the row
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
        const modalsFilter = (interaction) => interaction.customId === 'send-body';

        // Waits for the modal to be filled
        const newContent = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Responds to the interaction with a confirmation
            await modalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.correctEmbed.title}`)
                .setDescription(`${locale.correctEmbed.description}.`)
            ], ephemeral: true});

            // Returns the field of the body
            return modalInteraction.fields.getField('body').value;
            
        }).catch(() => { null; });

        // Aborts if a body was not provided in the expected time
        if (!newContent) return;

        // Checks if has to send an embed or a normal message
        if (type === 'embed') {

            // Edits the embed with the new content
            msg.edit({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setDescription(newContent)
            ]});

        } else if (type === 'normal') {

            // Edits the message with the new content
            await msg.edit({ content: newContent });
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

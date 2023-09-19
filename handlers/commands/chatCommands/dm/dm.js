export async function run(interaction, commandConfig, locale) {
    
    try {
        
        // Searches and stores the member
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        // Returns an error if the member was not found
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});
        
        // Returns an error if the member is a bot
        if (member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        // Stores the selected mode and type
        const mode = interaction.options._hoistedOptions[1].value;
        const type = interaction.options._hoistedOptions[2].value;

        // If anonymous mode has been selected
        if (mode === 'anonymous') {

            // Variable to know if is authorized
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.anonymousMode});

            // If the execution was not allowed, sends an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.unauthorized, { interactionAuthor: interaction.user })}.`)
            ], ephemeral: true});
        };

        // Stores an authorship string (in case it was necessary)
        const authoryString = `**${await client.functions.utils.parseLocale(locale.normalFrom, { authorTag: interaction.user.tag })}:**\n`;

        // Stores the maximum modal field length
        const fieldLength = type === 'embed' ? 4000 : type === 'normal' && mode === 'author'? 2000 - authoryString.length : 2000;

        // Generates a new modal
        const messageContentModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('dm-body');

        // Generates the only modal row
        const bodyRow = new discord.ActionRowBuilder().addComponents(

            // Adds a text field to row
            new discord.TextInputBuilder()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle(discord.TextInputStyle.Paragraph)
                .setMaxLength(fieldLength)
                .setRequired(true)
        );

        // Attaches the components to the modal
        messageContentModal.addComponents([bodyRow]);

        // Shows the modal to the user
        await interaction.showModal(messageContentModal);

        // Creates a filter to get the expected modal
        const modalsFilter = (interaction) => interaction.customId === 'dm-body';

        // Waits for the modal to be filled
        const bodyMessageModalInteraction = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            // Returns the resulting interaction
            return modalInteraction;
            
        }).catch(() => { null; });

        // Obtains the field of the body
        const messageBody = bodyMessageModalInteraction.fields.getField('body').value;

        // Aborts if a body was not provided in the expected time
        if (!messageBody) return;

        try {

            // Depending on the selected mode
            switch (mode) {

                // If wanted to be sent in "author" mode
                case 'author':

                    // If wanted to be sent a "embed" type message
                    if (type === 'embed') {

                        // Sends the message to the member
                        await member.user.send({ embeds: [ new discord.EmbedBuilder()
                            .setAuthor({ name: `${locale.embedFrom}: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
                            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                            .setDescription(messageBody)
                        ]});

                    } else if (type === 'normal') { // If wanted to be sent a "normal" type message

                        // Sends the message to the member
                        await member.user.send({ content: authoryString + messageBody });
                    };

                    // Stops the switch
                    break;

                // If wanted to be sent in "anonymous" mode
                case 'anonymous':

                    // If wanted to be sent a "embed" type message
                    if (type === 'embed') {

                        // Sends the message to the member
                        await member.user.send({ embeds: [ new discord.EmbedBuilder()
                            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                            .setDescription(messageBody)
                        ]});

                    } else if (type === 'normal') { // If wanted to be sent a "normal" type message

                        // Sends the message to the member
                        await member.user.send({ content: messageBody });
                    };

                    // Stops the switch
                    break;
            };

            // Sends a record to the records channel
            await client.functions.managers.sendLog('sentDM', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.loggingEmbed.title}`)
                .setDescription(await client.functions.utils.parseLocale(locale.loggingEmbed.description, { authorTag: interaction.user.tag, memberTag: member.user.tag, botUser: client.user }))
                .addFields(
                    { name: locale.loggingEmbed.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbed.mode, value: mode, inline: true },
                    { name: locale.loggingEmbed.type, value: type, inline: true },
                    { name: locale.loggingEmbed.content, value: `\`\`\`${messageBody.length > 1014 ? `${messageBody.slice(0, 1014)} ...` : messageBody}\`\`\``, inline: false }
                )
            );

            // Sends a confirmation message
            await bodyMessageModalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.notificationEmbed}`)
            ], ephemeral: true});

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) {
    
                // Sends a log to the console
                logger.warn(`The bot was unable to deliver a custom DM message to @${member.user.username} (${member.id}) due to an API restriction`);
    
                // Shows an error to the user who tried to send the message
                return await bodyMessageModalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.cantReceiveDms, { botUser: client.user })}.`)
                ], ephemeral: true});
            };
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
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: true
            },
            {
                optionName: 'mode',
                type: discord.ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        choiceName: 'author',
                        value: 'author'
                    },
                    {
                        choiceName: 'anonymous',
                        value: 'anonymous'
                    }
                ]
            },
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
            }
        ]
    }
};

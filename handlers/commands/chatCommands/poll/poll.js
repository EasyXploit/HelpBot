export async function run(interaction, commandConfig, locale) {

    try {

        // If has to finish a survey
        if (interaction.options._hoistedOptions[0]) {

            // Looks for the survey in the database
            const pollData = await client.functions.db.getData('poll', interaction.options._hoistedOptions[0].value);

            // If the survey does not exist, returns an error
            if (!pollData) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.unknownPoll, { id: interaction.options._hoistedOptions[0].value })}.`)
            ], ephemeral: true});

            // Searches and stores the survey channel
            const pollChannel = await client.functions.utils.fetch('channel', pollData.channelId);

            // Searches and stores the message of the survey (if the channel could be found)
            const pollMessage = pollChannel ? await client.functions.utils.fetch('message', pollData.messageId, pollChannel) : null;

            // If the channel or message of the survey no longer exist
            if (!pollChannel || !pollMessage) {

                // Deletes the survey from the database
                await client.functions.db.deltData('poll', interaction.options._hoistedOptions[0].value);
            
                // Notifies the error to the member
                return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.deletedPoll, { id: interaction.options._hoistedOptions[0].value })}.`)
                ], ephemeral: true});
            };

            // Checks, if applicable, that the member has permission to finish any survey
            if (interaction.member.id !== pollData.authorId) {

                // Variable to know if is authorized
                const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canEndAny});

                // If the execution was not allowed, sends an error message
                if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.onlyYours}.`)
                ], ephemeral: true});
            };

            // Strengthens the expiration of the survey
            pollData.expirationTimestamp = Date.now();

            // Sends a confirmation to the member
            return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.endedPollEmbed.title}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.endedPollEmbed.description, { poll: `[${pollData.title}](${pollMessage.url})`, pollChannel: pollChannel })}.`)
            ], ephemeral: true});
        };

        // Function to wait for member messages
        async function awaitMessage(msg) {

            // Stores the resulting message
            let resultMessage;

            // Generates a message filter
            const filter = msg => msg.author.id === interaction.member.id;

            // Waits messages on the channel
            await msg.channel.awaitMessages({filter: filter, max: 1, time: 60000}).then(async collected => {

                // Stores the content of the first result
                resultMessage = collected.first().content;

                // Deletes the message past 2 seconds
                setTimeout(() => collected.first().delete(), 2000);

            }).catch(() => msg.delete()); // Aborts the collector if messages are not sent

            // Returns the captured message
            return resultMessage;
        };

        // Notifies the start of the assistant
        interaction.reply({ content: `${locale.startingAssistant}...`});

        // Stores the interaction channel
        const interactionChannel = await client.functions.utils.fetch('channel', interaction.channelId);

        // Sends the embed of the selection of the title
        interactionChannel.send({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setTitle(`📊 ${locale.titleEmbed.title}`)
            .setDescription(locale.titleEmbed.description)
        ]}).then(async assistantEmbed => {

            // Waits a member message
            await awaitMessage(assistantEmbed).then(async title => {

                // Aborts if there was no message
                if (!title) return;

                // Edits the assistant to ask about the duration
                assistantEmbed.edit({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                    .setTitle(`⏱ ${locale.durationEmbed.title}`)
                    .setDescription(locale.durationEmbed.description)
                ]});

                // Waits a member message
                await awaitMessage(assistantEmbed).then(async duration => {

                    // Aborts if there was no message
                    if (!duration) return;

                    // If duration was provided
                    if (duration !== '-') {

                        // Separates the duration in parameters
                        const parameters = duration.split(' ');

                        // Converts and stores the magnitudes in milliseconds
                        duration = await client.functions.utils.magnitudesToMs(parameters);

                        // If milliseconds could not be obtained
                        if (!duration) {

                            // Aborts the assistant
                            assistantEmbed.delete();

                            // Deletes the first answer
                            interaction.deleteReply();

                            // Returns an error
                            return interactionChannel.send({ embeds: [ new discord.EmbedBuilder()
                                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                                .setDescription(`${client.customEmojis.redTick} ${locale.invalidDuration}.`)
                            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
                        };

                    } else duration = 0; // If it is indefinite, "0" is established as duration

                    // Edits the assistant to ask about a field
                    assistantEmbed.edit({ embeds: [ new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                        .setTitle(`:one: ${locale.firstFieldEmbed.title}`)
                        .setDescription(locale.firstFieldEmbed.description)
                    ]});

                    // Stores the introduced fields
                    let options = [];

                    // Stores the options numbered as emojis
                    const emojiOptions = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];

                    // Iterates from 0 to 9 (max. fields)
                    for (let index = 0; index < 10; index++) {

                        // Waits a member message
                        await awaitMessage(assistantEmbed).then(async option => {

                            // Aborts if there was no message
                            if (!option) return;

                            // Stores the option in the field list
                            options[index] = option;

                            // Edits the assistant to ask about another field
                            assistantEmbed.edit({ embeds: [ new discord.EmbedBuilder()
                                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                                .setTitle(`${emojiOptions[index + 1]} ${locale.newFieldEmbed.title}`)
                                .setDescription(`${await client.functions.utils.parseLocale(locale.newFieldEmbed.description, { remaining: 10 - index - 1 })}${ index > 0 ? `.\n${locale.newFieldEmbed.endAssistant}.` : ''}`)
                            ]});
                        });

                        

                        // If a field has not been provided, stops the loop
                        if (!options[index]) break;

                        // If don't want to provide more fields
                        if (options[index] === 'end' && options.length > 2) {

                            // Deletes the last stored field
                            options.splice(-1,1);

                            // Stops the loop
                            break;
                        };
                    };

                    // If enough fields were not provided, aborts
                    if (options.length < 2) return;

                    // Stores formatted options
                    let formattedOptions = '';

                    // For each of the options, concats it formatted
                    for (count = 0; count < options.length; count++) formattedOptions += `${emojiOptions[count]} ${options[count]}\n\n`;

                    // Stores the remaining time
                    let remainingTime = '∞';

                    // If the duration is different from 0
                    if (duration !== 0) {

                        // Calculates the remaining time format
                        const remainingDays = Math.floor((duration) / (60 * 60 * 24 * 1000));
                        const remainingHours = Math.floor((duration - (remainingDays * 86400000)) / (60 * 60 * 1000));
                        const remainingMinutes = Math.floor((duration - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60 * 1000));

                        // Stores the remaining time string
                        remainingTime = `${remainingDays}d ${remainingHours}h ${remainingMinutes}m`
                    };

                    // Stores a new ID for the survey
                    const pollId = await client.functions.utils.generateSid();
                    
                    // Sends the survey generated to the invocation channel
                    interactionChannel.send({ embeds: [ new discord.EmbedBuilder()
                        .setColor(`${await client.functions.db.getConfig('colors.polls')}`)
                        .setAuthor({ name: locale.pollEmbed.author, iconURL: 'attachment://poll.png' })
                        .setDescription(`${title}\n\n${formattedOptions}`)
                        .setFooter({ text: `ID: ${pollId} - ${locale.pollEmbed.duration}: ${remainingTime}` })
                    ], files: ['./assets/images/poll.png'] }).then(async pollEmbed => {

                        // Deletes the wizard's embed
                        assistantEmbed.delete();

                        // Deletes the first answer
                        interaction.deleteReply();

                        // For each of the options
                        for (count = 0; count < options.length; count++) {

                            // Reacts to the embed with the appropriate emoji
                            await pollEmbed.react([
                                '\u0031\u20E3',
                                '\u0032\u20E3',
                                '\u0033\u20E3',
                                '\u0034\u20E3',
                                '\u0035\u20E3',
                                '\u0036\u20E3',
                                '\u0037\u20E3',
                                '\u0038\u20E3',
                                '\u0039\u20E3',
                                '\uD83D\uDD1F'
                            ][count]);
                        };

                        // Stores the survey in the database
                        await client.functions.db.genData('poll', {
                            pollId: pollId,
                            channelId: interactionChannel.id,
                            messageId: pollEmbed.id,
                            authorId: interaction.member.id,
                            title: title,
                            options: formattedOptions
                        });

                        // If the survey expires, stores this timestamp
                        if (duration !== 0) await client.functions.db.setData('poll', pollId, { expirationTimestamp: Date.now() + duration });
                        
                        // Sends a message to the records channel
                        await client.functions.managers.sendLog('pollStarted', 'embed', new discord.EmbedBuilder()
                            .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                            .setAuthor({ name: await client.functions.utils.parseLocale(locale.loggingEmbed.author, { memberTag: interaction.member.user.tag }), iconURL: interaction.user.displayAvatarURL() })
                            .addFields(
                                { name: locale.loggingEmbed.title, value: `__[${title}](${pollEmbed.url})__`, inline: true },
                                { name: locale.loggingEmbed.channel, value: `${interactionChannel}`, inline: true },
                                { name: locale.loggingEmbed.expiration, value: duration !== 0 ? `<t:${Math.round(new Date(parseInt(Date.now() + duration)) / 1000)}:R>` : locale.loggingEmbed.noExpiration, inline: true }
                            )
                        );
                    });
                });
            });
        });

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis', 'ViewChannel', 'SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory']
    },
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'end',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};

export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores the Id of the channel provided, or the current one
        const channelId = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : interaction.channelId;
        const channel = await client.functions.utils.fetch('channel', channelId);

        // Checks if the channel exists
        if (!channel || ![discord.ChannelType.GuildText, discord.ChannelType.GuildNews, discord.ChannelType.GuildNewsThread, discord.ChannelType.GuildPublicThread, discord.ChannelType.GuildPrivateThread].includes(channel.type)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidChannel}.`)
        ], ephemeral: true});

        // Checks if the member has permissions to execute this action
        const missingPermissions = await client.functions.utils.missingPermissions(channel, interaction.member, ['ManageMessages', 'ReadMessageHistory'])
        if (missingPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noPermission, { channel: channel, missingPermissions: missingPermissions })}.`)
        ], ephemeral: true});

        // The specified number of messages is obtained (including the invocation)
        const messages = await channel.messages.fetch({limit: parseInt(interaction.options._hoistedOptions[0].value)});

        // If messages were not found on the channel, returns an error
        if (messages.size === 0) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noMessages, { channel: channel })}.`)
        ], ephemeral: true});

        // Stores the messages that will be deleted
        const msgsToDelete = new discord.Collection();

        // For each of the messages obtained
        await messages.forEach(msg => {

            // Adds it to the array if they are less than 2 weeks
            if (Date.now() - msg.createdTimestamp  < 1209600000) msgsToDelete.set(msg.id, msg);
        });

        // If no message was recent enough, returns an error
        if (msgsToDelete.size === 0) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.expiredMessages}.`)
        ], ephemeral: true});

        // Purges the messages of the selected channel
        await channel.bulkDelete(msgsToDelete);

        // Stores the confirmation embed description
        let successEmbedDescription = `${locale.successEmbed.description}: \`${msgsToDelete.size}\``;

        // Stores the confirmation message
        let successEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
            .setTitle(`${client.customEmojis.greenTick} ${locale.successEmbed.title}`)
            .setDescription(successEmbedDescription);

        // If messages were omitted, it is indicated in the embed footer
        if (msgsToDelete.size < messages.size) successEmbed.setFooter({  text: `${await client.functions.utils.parseLocale(locale.successEmbed.footer, { omittedCount: messages.size - msgsToDelete.size })}.` });

        // If the purge channel is the same as the invocation, warns of confirmation elimination
        if (channel.id === interaction.channelId) successEmbed.setDescription(`${successEmbedDescription}\n${await client.functions.utils.parseLocale(locale.successEmbed.willBeDeleted, { inSeconds: `<t:${Math.round(new Date(parseInt(Date.now() + 5000)) / 1000)}:R>` })}`)

        // Sends a confirmation message
        await interaction.reply({ embeds: [successEmbed] })
        
        //Si el canal de la purga es el mismo que el de invocación, elimina la confirmación a los 5 segundos
        if (channel.id === interaction.channelId) setTimeout(async () => {

            try {

                // Elimina el mensaje de confirmación
                await interaction.deleteReply();

            } catch (error) {
    
                // Si el mensaje ya fue eliminado, no hace nada
                if (!error.toString().includes('DiscordAPIError: Unknown Message')) throw error;
            };
            
        }, 5000);

        // Sends a record to the records channel
        await client.functions.managers.sendLog('purgedChannel', 'embed', new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
            .setTitle(`📑 ${locale.loggingEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.loggingEmbed.description, { authorTag: interaction.user.tag, deletedCount: msgsToDelete.size, channel: channel }))
        );

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

//"<cantidad> [#canal | id]"

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
                optionName: 'quantity',
                type: discord.ApplicationCommandOptionType.Integer,
                required: true,
                minValue: 1,
                maxValue: 99
            },
            {
                optionName: 'channel',
                type: discord.ApplicationCommandOptionType.Channel,
                required: false
            }
        ]
    }
};

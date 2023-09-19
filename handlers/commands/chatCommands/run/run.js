export async function run(interaction, commandConfig, locale) {
    
    try {

        // Depending on the specified command
        switch (interaction.options._hoistedOptions[0].value) {
            
            case 'welcome': // Emits the "guildMemberAdd" event
                
                // Returns an error if a member has not been provided
                if (!interaction.options._hoistedOptions[1]) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.memberNotProvided}.`)
                ], ephemeral: true});

                // Looks for the member in the guild
                const targetWelcomeMember = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[1].value);

                // Returns an error if a valid member has not been provided
                if (!targetWelcomeMember) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.invalidMember}.`)
                ], ephemeral: true});
                
                // Emits the event
                await client.emit('guildMemberAdd', targetWelcomeMember);

                // Sends a confirmation message
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.welcome.done}`)
                ], ephemeral: true});

                // Stops the execution
                break;
        
            case 'goodbye': // Emits the "guildMemberRemove" event
                
                // Returns an error if a member has not been provided
                if (!interaction.options._hoistedOptions[1]) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.memberNotProvided}.`)
                ], ephemeral: true});

                // Looks for the member in the guild
                const targetGoodybeMember = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[1].value);

                // Returns an error if a valid member has not been provided
                if (!targetGoodybeMember) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.invalidMember}.`)
                ], ephemeral: true});
                
                // Emits the event
                await client.emit('guildMemberRemove', targetGoodybeMember);

                // Sends a confirmation message
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.goodbye.done}`)
                ], ephemeral: true});

                // Stops the execution
                break;
            
            default: // In case an existing command has not been provided

                // Sends an error message
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.invalidCommand}.`)
                ], ephemeral: true});

                // Stops the execution
                break;
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
                optionName: 'script',
                type: discord.ApplicationCommandOptionType.String,
                required: true
            },
            {
                optionName: 'parameters',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};

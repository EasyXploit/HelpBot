// Exports the event management function
export default async (interaction, locale) => {

    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;
        
        // Aborts if it is not an event from the base guild
        if (interaction.guild && interaction.guild.id !== client.baseGuild.id) return;

        // If the interaction is a command
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {

            // Variable to store the type of command
            let commandType;

            // Depending on the type of interaction, the appropriate type will be stored
            if (interaction.isMessageContextMenuCommand()) commandType = 'messageCommands'
            else if (interaction.isUserContextMenuCommand()) commandType = 'userCommands';
            else commandType = 'chatCommands'

            // Looks for the command by name
            const command = client.commands[commandType].get(interaction.commandName);
            if (!command) return; // Aborts if could not find it

            // Aborts if the command is disabled
            if (!command.userConfig.enabled) return interaction.reply({embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                .setDescription(`${client.customEmojis.grayTick} ${await client.functions.utils.parseLocale(locale.disabledCommand, { commandName: interaction.commandName })}.`)
            ], ephemeral: true});

            // Checks if the bot has the required channel permissions
            const missingChannelPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.members.me, command.config.neededBotPermissions.channel);
            if (missingChannelPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.missingChannelPermissions, { missingPermissions: missingChannelPermissions })}.`)
            ], ephemeral: true});

            // Checks if the bot has the required guild permissions
            const missingGuildPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, command.config.neededBotPermissions.guild);
            if (missingGuildPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.missingGuildPermissions, { missingPermissions: missingGuildPermissions })}.`)
            ], ephemeral: true});
            
            // Executes the command
            command.run(interaction, command.userConfig, client.locale.handlers.commands[commandType][command.fileName]);
        };

        // If the interaction was autocompleted
        if (interaction.isAutocomplete()) {

            // Gets the command information
            const command = client.commands.chatCommands.get(interaction.commandName);
            if (!command || !command.autocomplete) return; // Aborts if could not find it

            // Executes the autocomplete method
            command.autocomplete(interaction, command, client.locale.handlers.commands.chatCommands[command.fileName]);
        };

        // If the interaction was a button
        if (interaction.isButton()) {

            try {

                // Loads the corresponding file to handle the button
                const handlerFile = import(`../buttons/${interaction.customId}.js`);

                // Executes the interaction handler
                handlerFile.default(interaction);

            } catch (error) {

                // If the file was not found, ignores
                if (error.toString().includes('Cannot find module')) return;
            };
        };

    } catch (error) {

        // Returns an error in the console
        logger.error(error.stack);
    };
};

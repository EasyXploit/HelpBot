export default async (interaction, locale) => {

    try {
        
        //Aborta si no es un evento de la guild registrada
        if (interaction.guild && interaction.guild.id !== client.baseGuild.id) return;

        //Si la interacción es un comando
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {

            //variable para almacenar el tipo de comando
            let commandType;

            //En función del tipo de interacción, se almacenará el tipo adecuado
            if (interaction.isMessageContextMenuCommand()) commandType = 'messageCommands'
            else if (interaction.isUserContextMenuCommand()) commandType = 'userCommands';
            else commandType = 'chatCommands'

            //Busca el comando por su nombre
            const command = client.commands[commandType].get(interaction.commandName);
            if (!command) return; //Aborta si no lo encuentra

            //Aborta si el comando está deshabilitado
            if (!command.userConfig.enabled) return interaction.reply({embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                .setDescription(`${client.customEmojis.grayTick} ${await client.functions.utils.parseLocale(locale.disabledCommand, { commandName: interaction.commandName })}.`)
            ], ephemeral: true});

            //Comprueba si el bot tiene los permisos de canal requeridos
            const missingChannelPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.members.me, command.config.neededBotPermissions.channel);
            if (missingChannelPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.missingChannelPermissions, { missingPermissions: missingChannelPermissions })}.`)
            ], ephemeral: true});

            //Comprueba si el bot tiene los permisos de guild requeridos
            const missingGuildPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, command.config.neededBotPermissions.guild);
            if (missingGuildPermissions) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.missingGuildPermissions, { missingPermissions: missingGuildPermissions })}.`)
            ], ephemeral: true});
            
            //Ejecuta el comando
            command.run(interaction, command.userConfig, client.locale.handlers.commands[commandType][command.fileName]);
        };

        //Si la interacción era de autocompletado
        if (interaction.isAutocomplete()) {

            //Obtiene la información del comando
            const command = client.commands.chatCommands.get(interaction.commandName);
            if (!command || !command.autocomplete) return; //Aborta si no lo encuentra

            //Ejecuta el método de autocompletado
            command.autocomplete(interaction, command, client.locale.handlers.commands.chatCommands[command.fileName]);
        };

        //Si la interacción era un botón
        if (interaction.isButton()) {

            try {

                //Carga el archivo correspondiente para manejar el botón
                const handlerFile = import(`../buttons/${interaction.customId}.js`);

                //Ejecuta el manejador de la interacción
                handlerFile.default(interaction);

            } catch (error) {

                //Si no se encontró el archivo, ignora
                if (error.toString().includes('Cannot find module')) return;
            };
        };

    } catch (error) {

        //Devuelve un error en la consola
        logger.error(error.stack);
    };
};

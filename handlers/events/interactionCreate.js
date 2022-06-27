exports.run = async (interaction, client, locale) => {

    try {
        
        //Aborta si no es un evento de la guild registrada
        if (interaction.guild && interaction.guild.id !== client.homeGuild.id) return;

        //Si la interacción es un comando
        if (interaction.isCommand() || interaction.isContextMenu()) {

            //variable para almacenar el tipo de comando
            let commandType;

            //En función del tipo de interacción, se almacenará el tipo adecuado
            if (!interaction.targetType) commandType = 'chatCommands'
            else if (interaction.targetType === 'MESSAGE') commandType = 'messageCommands'
            else if (interaction.targetType === 'USER') commandType = 'userCommands';

            //Busca el comando por su nombre
            const command = client.commands[commandType].get(interaction.commandName);
            if (!command) return; //Aborta si no lo encuentra

            //Aborta si el comando está deshabilitado
            if (!command.userConfig.enabled) return interaction.reply({embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.information)
                .setDescription(`${client.customEmojis.grayTick} ${await client.functions.utilities.parseLocale.run(locale.disabledCommand, { commandName: interaction.commandName })}.`)
            ], ephemeral: true});
            
            //Ejecuta el comando
            command.run(client, interaction, command.userConfig, client.locale.handlers.commands[commandType][command.fileName]);
        };

        //Si la interacción era de autocompletado
        if (interaction.isAutocomplete()) {

            //Obtiene la información del comando
            const command = client.commands.chatCommands.get(interaction.commandName);
            if (!command || !command.autocomplete) return; //Aborta si no lo encuentra

            //Ejecuta el método de autocompletado
            command.autocomplete(client, interaction, command, client.locale.handlers.commands.chatCommands[command.fileName]);
        };

        //Si la interacción era un botón
        if (interaction.isButton()) {

            try {

                //Carga el archivo correspondiente para manejar el botón
                const handlerFile = require(`../buttons/${interaction.customId}.js`);

                //Ejecuta el manejador de la interacción
                handlerFile.run(client, interaction);

            } catch (error) {

                //Si no se encontró el archivo, ignora
                if (error.toString().includes('Cannot find module')) return;
            };
        };

    } catch (error) {

        //Devuelve un error en la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};

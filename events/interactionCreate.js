exports.run = async (interaction, client) => {

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
            if (!command) return; //Devuelve si no lo encuentra

            //Almacena la configuración del comando
            let commandConfig = client.config[commandType][command.config.appData.name];

            //Devuelve si el comando está deshabilitado
            if (!commandConfig.enabled) return interaction.reply({embeds: [new client.MessageEmbed().setColor(client.config.colors.unavailable).setDescription(`❕ El comando \`/${interaction.commandName}\` ha sido deshabilitado.`)]});

            //Comprueba si el miembro tiene un cooldown
            //if (client.cooldownedUsers.has(interaction.user.id)) return interaction.reply({embeds: [new client.MessageEmbed().setColor(client.config.colors.error).setDescription(`❌ Debes esperar 2 segundos antes de poder usar este comando.`)], ephemeral: true});

            //Ejecuta el comando
            command.run(client, interaction);

            //Añade un cooldown de 2s para el usuario
            /*client.cooldownedUsers.add(interaction.user.id);
            setTimeout(() => {
                client.cooldownedUsers.delete(interaction.user.id);
            }, 2000);*/
        };

        //Si la interacción es un menú de selección
        if (interaction.isSelectMenu()) {

            //Separa el ID personalizado por argumentos
            const splittedCustomId = interaction.customId.split('-');

            //Carga el archivo correspondiente para manejar el menú
            const handlerFile = require(`../handlers/selectMenus/${splittedCustomId[0]}.js`);

            //Si el fichero no existe, aborta
            if (!handlerFile) return;

            //Ejecuta el manejador de la interacción
            handlerFile.run(client, interaction, splittedCustomId[1] || null);
        };

        //Si la interacción es un botón
        if (interaction.isButton()) {

            //Carga el archivo correspondiente para manejar el botón
            const handlerFile = require(`../handlers/buttons/${interaction.customId}.js`);

            //Si el fichero no existe, aborta
            if (!handlerFile) return;

            //Ejecuta el manejador de la interacción
            handlerFile.run(client, interaction);
        };

        //Si la interacción es un formulario
        if (interaction.isModalSubmit()) {

            //Carga el archivo correspondiente para manejar el formulario
            const handlerFile = require(`../handlers/modals/${interaction.customId}.js`);

            //Si el fichero no existe, aborta
            if (!handlerFile) return;

            //Ejecuta el manejador de la interacción
            handlerFile.run(client, interaction);
        };

    } catch (error) {

        //Devuelve un error en la consola
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};

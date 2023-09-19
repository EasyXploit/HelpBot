// Exports a function to load the bot commands in the API
export async function loadCommands() {

    // Creates collections to store commands
    client.commands = { chatCommands: {}, messageCommands: {}, userCommands: {} };
    Object.keys(client.commands).forEach(x => client.commands[x] = new discord.Collection());

    // Stores the globally registered commands
    const clientCommands = await client.application.commands.fetch();

    // Stores the registered commands at the base guild
    const guildCommands = await client.baseGuild.commands.fetch();

    // Stores the name selected for commands
    let localeForNames = client.locale;

    // Stores the locale to which the translations of the commands are forced
    const forceNameLocale = await client.functions.db.getConfig('commands.forceNameLocale');

    // If a different location has been selected
    if (forceNameLocale && forceNameLocale.length > 0) {

        // Stores the original names of the files
        let localeFiles = fs.readdirSync('./locales/');

        // Stores the names without extension
        let availableLocales = [];
        
        // For each file, stores its name without extension in the "availableLocales" array
        for (let file = 0; file < localeFiles.length; file ++) availableLocales.push(localeFiles[file].replace('.json', ''));

        // If there is a locale with that name
        if (availableLocales.includes(forceNameLocale)) {

            // Replaces the names of the commands with those of that locale
            localeForNames = require(`./locales/${forceNameLocale}.json`);
        };
    };

    // Stores local command settings
    const commandsConfig = await client.functions.db.getConfig('commands');

    // Commands load - reads the directory of command categories
    for (const commandType of await fs.readdirSync('./handlers/commands/')) {

        // Creates an object to register the commands
        const localCommands = {};

        // Reads the directory of command categories
        for (const commandType of await fs.readdirSync('./handlers/commands/')) {

            // For each command directory (directories for each type), reads the commands it contains
            for (const commandName of await fs.readdirSync(`./handlers/commands/${commandType}/`)) {

                // Adds to the command object, a relationship between the localized name and the file name
                const commandLocalizedName = commandType === 'chatCommands' ? localeForNames.handlers.commands[commandType][commandName].appData.name : client.locale.handlers.commands[commandType][commandName].appData.name;
                localCommands[commandLocalizedName] = commandName;
            };
        };

        // Stores the names of the ignored commands
        const ignoredCommands = await client.functions.db.getConfig('commands.ignored');

        // Creates a collection with all the remote commands
        const remoteCommands = clientCommands.concat(guildCommands);

        // For each client command
        for (const command of remoteCommands) {

            // Checks if the type of command matches the local configuration, and it is not a command to ignore
            if (command[1].type === discord.ApplicationCommandType.ChatInput && (commandType !== 'chatCommands' || ignoredCommands.chatCommands.includes(command[1].name))) continue;
            if (command[1].type === discord.ApplicationCommandType.Message && (commandType !== 'messageCommands' || ignoredCommands.messageCommands.includes(command[1].name))) continue;
            if (command[1].type === discord.ApplicationCommandType.User && (commandType !== 'userCommands' || ignoredCommands.userCommands.includes(command[1].name))) continue;

            // If the command does not exist locally
            if (!Object.keys(localCommands).includes(command[1].name)) {

                // If it was guild type
                if (command[1].guildId) {

                    // Deletes the guild command and notifies it
                    await client.baseGuild.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] un-registered at ${client.baseGuild.name}`);

                } else {

                    // Deletes the client command and notifies it
                    await client.application.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] un-registered globally`);
                };

            } else {

                // Requires the command to obtain it's information
                const importedCommand = await import(`../../handlers/commands/${commandType}/${localCommands[command[1].name]}/${localCommands[command[1].name]}.js`);
                const appType = importedCommand.config.type;

                // If it is a guild command but the local type no longer matches
                if (command[1].guildId && appType !== 'guild') {

                    // Deletes it and notifies it
                    await client.baseGuild.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] converted to \"global\" type`);

                // If it is a global command but the local type no longer matches
                } else if (!command[1].guildId && appType === 'guild') {

                    // Deletes it and notifies it
                    await client.application.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] converted to \"guild\" type`);
                };
            };
        };

        // For each command directory (directories for each type), reads the commands it contains
        for (const commandName of await fs.readdirSync(`./handlers/commands/${commandType}/`)) {

            // Requires "lodash" to compare objects
            let lodash = require('lodash');

            // Requires the command to obtain it's information
            let importedCommandData = await import(`../../handlers/commands/${commandType}/${commandName}/${commandName}.js`);
              
            // Creates an object to store the command data
            let newCommandData = {
                config: lodash.cloneDeep(importedCommandData.config),
                run: importedCommandData.run,  // 'run' is a function, so it is not cloned
            };

            // Generates an object to store the command data
            let commandData = {};

            // For each of the properties of the imported module, recreates them in the data object of the command
            for (const key in newCommandData) commandData[key] = newCommandData[key];

            // Stores the local configuration of the command
            let localCmd = commandData.config;

            // Stores the translations for that command
            const appDataLocale = client.locale.handlers.commands[commandType][commandName].appData;

            // Adds the name to the command
            localCmd.appData.name = commandType === 'chatCommands' ? localeForNames.handlers.commands[commandType][commandName].appData.name : client.locale.handlers.commands[commandType][commandName].appData.name;

            // If it is a diagonal bar command
            if (commandType === 'chatCommands') {

                // Adds the description to the command, and cuts it if needed
                localCmd.appData.description = appDataLocale.description.length > 100 ? `${appDataLocale.description.slice(0, 96)} ...` : appDataLocale.description.trimEnd();

                // For each of the options
                if (localCmd.appData.options) for (const option of localCmd.appData.options) {

                    // Stores it's translation
                    const optionLocale = appDataLocale.options[option.optionName];

                    // Normalizes the fields of name and description
                    option.name = optionLocale.name.toLowerCase().replaceAll(' ', '_');
                    option.description = optionLocale.description.length > 100 ? `${optionLocale.description.slice(0, 96)} ...` : optionLocale.description.trimEnd();

                    // Removes the provisional "optionName" field
                    delete option.optionName;

                    // For each of the nested options
                    if (option.options) for (const nestedOption of option.options) {

                        // Stores the translation of the option
                        const nestedOptionLocale = optionLocale.options[nestedOption.optionName];

                        // Overwrites the name and description field
                        nestedOption.name = nestedOptionLocale.name.toLowerCase().replaceAll(' ', '_');
                        nestedOption.description = nestedOptionLocale.description.length > 100 ? `${nestedOptionLocale.description.slice(0, 96)} ...` : nestedOptionLocale.description.trimEnd();

                        // Removes the provisional "optionName" field
                        delete nestedOption.optionName;
                    };

                    // For each of the elections
                    if (option.choices) for (const choice of option.choices) {

                        // Stores the translation of the choice
                        const choiceLocale = optionLocale.choices[choice.choiceName];

                        // Overwrites the name field
                        choice.name = choiceLocale;

                        // Removes the provisional "choiceName" field
                        delete choice.choiceName;
                    };
                };
            };

            // Stores the command settings
            const userConfig = commandsConfig[commandType][commandName];

            // Omits if the command has no configuration
            if (!userConfig) {
                logger.warn(`Command [${commandType}/${commandName}] has no configuration in commands.json`);
                continue;
            };

            // Checks if there are conflicts with other commands that have the same name
            for (const type of Object.keys(client.commands)) {
                if (client.commands[type].get(localCmd.appData.name)) {
                    logger.warn(`Two or more commands have the same name: ${localCmd.appData.name}`);
                    continue;
                };
            };

            // Stores the remote command
            let remoteCmd = await (async () => {
                switch(localCmd.type) {
                    case 'global': return await clientCommands.find(remoteCmd => remoteCmd.name === localCmd.appData.name);
                    case 'guild': return await guildCommands.find(remoteCmd => remoteCmd.name === localCmd.appData.name);
                };
            })();

            // Checks whether the command is registered or not
            if (!remoteCmd) {

                // If it's not a valid type
                if (!['global', 'guild'].includes(localCmd.type)) {

                    // Warns and omits the command
                    
                    logger.warn(`The command [${commandType}/${commandName}] does not have a valid type`);
                    continue;
                };

                // Stores the appropriate command manager depending on the type of command
                const commandsManager = localCmd.type === 'global' ? client.application.commands : client.baseGuild.commands

                // Records the command in the manager
                await commandsManager.create({
                    name: localCmd.appData.name,
                    description: localCmd.appData.description,
                    type: localCmd.appData.type,
                    options: localCmd.appData.options,
                    defaultMemberPermissions: localCmd.defaultMemberPermissions,
                    dmPermission: localCmd.dmPermission
                });

                // Stores the message for the confirmation
                const logString = localCmd.type === 'global' ? 
                    `Command [${commandType}/${localCmd.appData.name}] registered globally` :
                    `Command [${commandType}/${localCmd.appData.name}] registered in ${client.baseGuild.name}`;
                
                // Sends a console confirmation message
                logger.debug(`${logString}`);

            } else {

                // Removes null or undefined keys of the remote options
                let remoteCmdOptions = await client.functions.utils.isArrOfObjNil(remoteCmd.options, lodash);

                // If there are local options, stores them, or creates an empty object
                const localCmdOptions = localCmd.appData.options ? localCmd.appData.options : [];

                // Checks if the details are the same
                if (remoteCmd.description !== (localCmd.appData.description || '') || remoteCmd.type !== localCmd.appData.type || !lodash.isEqual(remoteCmdOptions, localCmdOptions || [])) {
                    
                    // If they are not, records the change
                    await remoteCmd.edit({
                        description: localCmd.appData.description,
                        type: localCmd.appData.type,
                        options: localCmd.appData.options
                    });
    
                    // Sends a console confirmation message
                    logger.debug(`The command [${commandType}/${localCmd.appData.name}] has updated its parameters`);
                };

                // Checks if the permission by default stored is the same as the registered
                if (remoteCmd.defaultMemberPermissions?.bitfield !== localCmd.defaultMemberPermissions?.bitfield) {
                    
                    // Updates the default permission
                    await remoteCmd.edit({
                        defaultMemberPermissions: localCmd.defaultMemberPermissions
                    });
    
                    // Sends a console confirmation message
                    logger.debug(`The command [${commandType}/${localCmd.appData.name}] has updated its default member permissions`);
                };

                // Checks if the use permission by MD is the same as the registered
                if (remoteCmd.dmPermission !== localCmd.dmPermission) {
                    
                    // Updates the use permission by MD
                    await remoteCmd.edit({
                        dmPermission: localCmd.dmPermission
                    });
    
                    // Sends a console confirmation message
                    logger.debug(`The command [${commandType}/${localCmd.appData.name}] has updated its permission to be used via DM`);
                };
            };

            // Stores the command user configuration in the command data
            commandData.userConfig = userConfig;

            // Stores the name of the command file in the command data
            commandData.fileName = commandName;

            // Adds the command to the collection
            await client.commands[commandType].set(localCmd.appData.name, commandData);

            // Sends a confirmation message
            logger.debug(`Command [${commandType}/${localCmd.appData.name}] loaded successfully`);
        };
    };
};

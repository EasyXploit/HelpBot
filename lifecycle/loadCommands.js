
exports.run = async (client) => {

    //Almacena las traducciones
	const locale = client.locale.lifecycle.loadCommands;

    //Salta una línea en la consola
    console.log('\n');

    //Crea colecciones para almacenar los comandos
    client.commands = { chatCommands: {}, messageCommands: {}, userCommands: {} };
    Object.keys(client.commands).forEach(x => client.commands[x] = new client.Collection());

    //Almacena los comandos registrados globalmente
    const clientCommands = await client.application.commands.fetch();

    //Almacena los comandos registrados en la homeGuild
    const guildCommands = await client.homeGuild.commands.fetch();

    //Almacena el nombre seleccionado para los comandos 
    let localeForNames = client.locale;

    //Si se ha seleccionado un locale diferente
    if (client.config.commands.forceNameLocale.length > 0) {

        //Almacena los nombres originales de los archivos
        let localeFiles = client.fs.readdirSync('./resources/locales/');

        //Almacena los nombres sin extensión
        let availableLocales = [];
        
        //Para cada archivo, almacena su nombre sin extensión en el array "availableLocales"
        for (let file = 0; file < localeFiles.length; file ++) availableLocales.push(localeFiles[file].replace('.json', ''));

        //Si hay un locale con ese nombre
        if (availableLocales.includes(client.config.commands.forceNameLocale)) {

            //Reemplaza los nombres de los comandos por los de ese locale
            localeForNames = require(`../resources/locales/${client.config.commands.forceNameLocale}.json`);
        };
    };

    //Carga de comandos - Lee el directorio de las categorías de comandos
    for (const commandType of await client.fs.readdirSync('./handlers/commands/')) {

        //Crea un objeto para registrar los comandos
        const localCommands = {};

        //Lee el directorio de las categorías de comandos
        for (const commandType of await client.fs.readdirSync('./handlers/commands/')) {

            //Para cada directorio de comandos (directorios por cada tipo), lee los comandos que contiene
            for (const commandName of await client.fs.readdirSync(`./handlers/commands/${commandType}/`)) {

                //Sube al objeto de comando, una relación entre el nombre localizado y el nombre de archivo
                const commandLocalizedName = commandType === 'chatCommands' ? localeForNames.handlers.commands[commandType][commandName].appData.name : client.locale.handlers.commands[commandType][commandName].appData.name;
                localCommands[commandLocalizedName] = commandName;
            };
        };

        //Almacena los nombres de los comandos ignorados
        const ignoredCommands = client.config.commands.ignored;

        //Crea una colección con todos los comandos remotos
        const remoteCommands = clientCommands.concat(guildCommands);

        //Para cada comando de cliente
        for (const command of remoteCommands) {

            //Comprueba si el tipo de comando coincide con la config. local, y no es un comando a ignorar
            if (command[1].type === 'CHAT_INPUT' && (commandType !== 'chatCommands' || ignoredCommands.chatCommands.includes(command[1].name))) continue;
            if (command[1].type === 'MESSAGE' && (commandType !== 'messageCommands' || ignoredCommands.messageCommands.includes(command[1].name))) continue;
            if (command[1].type === 'USER' && (commandType !== 'userCommands' || ignoredCommands.userCommands.includes(command[1].name))) continue;

            //Si el comando no existe localmente
            if (!Object.keys(localCommands).includes(command[1].name)) {

                //Si era de tipo guild
                if (command[1].guildId) {

                    //Borra el comando de la guild y lo notifica
                    await client.homeGuild.commands.delete(command[1]);
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.unregisteredFromGuild, { command: `[${commandType}/${command[1].name}]`, guildName: client.homeGuild.name })}.`);

                } else {

                    //Borra el comando del cliente y lo notifica
                    await client.application.commands.delete(command[1]);
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.unregisteredFromGlobal, { command: `[${commandType}/${command[1].name}]` })}.`);
                };

            } else {

                //Requiere el comando para obtener su información
                const appType = await require(`../handlers/commands/${commandType}/${localCommands[command[1].name]}/${localCommands[command[1].name]}.js`).config.type;

                //Si es un comando de guild pero el tipo local ya no coincide
                if (command[1].guildId && appType !== 'guild') {

                    //Lo borra y lo notifica
                    await client.homeGuild.commands.delete(command[1]);
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.convertedToGlobal, { command: `[${commandType}/${command[1].name}]` })}.`);

                //Si es un comando global pero el tipo local ya no coincide
                } else if (!command[1].guildId && appType === 'guild') {

                    //Lo borra y lo notifica
                    await client.application.commands.delete(command[1]);
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.convertedToGuild, { command: `[${commandType}/${command[1].name}]` })}.`);
                };
            };
        };

        //Para cada directorio de comandos (directorios por cada tipo), lee los comandos que contiene
        for (const commandName of await client.fs.readdirSync(`./handlers/commands/${commandType}/`)) {

            //Requiere el comando para obtener su información
            const commandData = await require(`../handlers/commands/${commandType}/${commandName}/${commandName}.js`);
            let localCmd = commandData.config;

            //Almacena las traducciones para ese comando
            const appDataLocale = client.locale.handlers.commands[commandType][commandName].appData;

            //Añade el nombre al comando
            localCmd.appData.name = commandType === 'chatCommands' ? localeForNames.handlers.commands[commandType][commandName].appData.name : client.locale.handlers.commands[commandType][commandName].appData.name;

            //Si se trata de un comando de barra diagonal
            if (commandType === 'chatCommands') {

                //Añade la descripción al comando, y la recorta si procede                
                localCmd.appData.description = appDataLocale.description.length > 100 ? `${appDataLocale.description.slice(0, 96)} ...` : appDataLocale.description.trimEnd();

                //Por cada una de las opciones
                if (localCmd.appData.options) for (const option of localCmd.appData.options) {

                    //Almacena su traducción
                    const optionLocale = appDataLocale.options[option.optionName];

                    //Sobreescribe el campo de nombre y el de descripción
                    option.name = optionLocale.name.toLowerCase();
                    option.description = optionLocale.description.length > 100 ? `${optionLocale.description.slice(0, 96)} ...` : optionLocale.description.trimEnd();

                    //Elimina el campo de "optionName" provisional
                    delete option.optionName;

                    //Por cada una de las opciones anidadas
                    if (option.options) for (const nestedOption of option.options) {

                        //Almacena la traducción de la opción
                        const nestedOptionLocale = optionLocale.options[nestedOption.optionName];

                        //Sobreescribe el campo de nombre y el de descripción
                        nestedOption.name = nestedOptionLocale.name.toLowerCase();
                        nestedOption.description = nestedOptionLocale.description.length > 100 ? `${nestedOptionLocale.description.slice(0, 96)} ...` : nestedOptionLocale.description.trimEnd();

                        //Elimina el campo de "optionName" provisional
                        delete nestedOption.optionName;
                    };

                    //Por cada una de las elecciones
                    if (option.choices) for (const choice of option.choices) {

                        //Almacena la traducción de la elección
                        const choiceLocale = optionLocale.choices[choice.choiceName];

                        //Sobreescribe el campo de nombre
                        choice.name = choiceLocale;

                        //Elimina el campo de "choiceName" provisional
                        delete choice.choiceName;
                    };
                };
            };

            //Almacena la configuración del comando
            const userConfig = client.config.commands[commandType][commandName];

            //Omite si el comando no tiene fichero de configuración
            if (!userConfig) {
                console.log(` - [ERR] ${await client.functions.utilities.parseLocale.run(locale.convertedToGuild, { command: `[${commandType}/${commandName}]` })}.`);
                continue;
            };

            //Comprueba si hay conflictos con otros comandos que tengan el mismo nombre
            for (const type of Object.keys(client.commands)) {
                if (client.commands[type].get(localCmd.appData.name)) {
                    console.warn(`- [ERR] ${locale.sameCommandNamesError}: ${localCmd.appData.name}.`);
                    continue;
                };
            };

            //Almacena el comando remoto
            let remoteCmd = await (async () => {
                switch(localCmd.type) {
                    case 'global': return await clientCommands.find(remoteCmd => remoteCmd.name === localCmd.appData.name);
                    case 'guild': return await guildCommands.find(remoteCmd => remoteCmd.name === localCmd.appData.name);
                };
            })();

            //Comprueba si el comando está registrado o no
            if (!remoteCmd) {

                //Si no es un tipo válido
                if (!['global', 'guild'].includes(localCmd.type)) {

                    //Advierte y omite el comando
                    console.log(` - [ERR] ${await client.functions.utilities.parseLocale.run(locale.invalidTypeError, { command: `[${commandType}/${commandName}]` })}.`);
                    continue;
                };

                //Almacena el manager de comandos adecuado en función del tipo de comando
                const commandsManager = localCmd.type === 'global' ? client.application.commands : client.homeGuild.commands

                //Registra el comando en el manager
                await commandsManager.create({
                    name: localCmd.appData.name,
                    description: localCmd.appData.description,
                    type: localCmd.appData.type,
                    options: localCmd.appData.options,
                    defaultPermission: localCmd.defaultPermission,
                    dmPermission: localCmd.dmPermission
                });

                //Almacena el mensaje para la confirmación
                const logString = localCmd.type === 'global' ? 
                    await client.functions.utilities.parseLocale.run(locale.registeredOnGlobal, { command: `[${commandType}/${localCmd.appData.name}]` }) : 
                    await client.functions.utilities.parseLocale.run(locale.registeredOnGuild, { command: `[${commandType}/${localCmd.appData.name}]`, guildName: client.homeGuild.name });
                
                
                //Envía un mensaje de confirmación por consola
                console.log(` - [UP] ${logString}.`);

            } else {

                //Requiere "lodash" para comparar objetos
                let lodash = require('lodash');

                //Elimina las claves nulas o indefinidas de las opciones remotas
                let remoteCmdOptions = await client.functions.utilities.isArrOfObjNil.run(client, remoteCmd.options, lodash);

                //Si hay opciones locales, las almacena, sino crea un objeto vacío
                const localCmdOptions = localCmd.appData.options ? localCmd.appData.options : [];

                //Comprueba si los detalles son los mismos
                if (remoteCmd.description !== (localCmd.appData.description || '') || remoteCmd.type !== localCmd.appData.type || !lodash.isEqual(remoteCmdOptions, localCmdOptions || [])) {

                    //Si no lo son, registra el cambio
                    await remoteCmd.edit({
                        description: localCmd.appData.description,
                        type: localCmd.appData.type,
                        options: localCmd.appData.options
                    });
    
                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.parametersUpdated, { command: `[${commandType}/${localCmd.appData.name}]` })}.`);
                };

                //Comprueba si el permiso por defecto almacenado es el mismo que el registrado
                if (remoteCmd.defaultPermission !== localCmd.defaultPermission) {
                    
                    //Actualiza el permiso por defecto
                    await remoteCmd.edit({
                        defaultPermission: localCmd.defaultPermission
                    });
    
                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.defaultPermUpdated, { command: `[${commandType}/${localCmd.appData.name}]` })}.`);
                };

                //Comprueba si el permiso de uso mediante MD es el mismo que el registrado
                if (remoteCmd.dmPermission !== localCmd.dmPermission) {
                    
                    //Actualiza el permiso de uso mediante MD
                    await remoteCmd.edit({
                        dmPermission: localCmd.dmPermission
                    });
    
                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${await client.functions.utilities.parseLocale.run(locale.dmPermUpdated, { command: `[${commandType}/${localCmd.appData.name}]` })}.`);
                };
            };

            //Almacena la config. de usuario del comando en los datos del comando
            commandData.userConfig = userConfig;

            //Almacena el nombre del archivo del comando en los datos del comando
            commandData.fileName = commandName;

            //Añade el comando a la colección
            await client.commands[commandType].set(localCmd.appData.name, commandData);

            //Manda un mensaje de confirmación
            console.log(` - [OK] ${await client.functions.utilities.parseLocale.run(locale.loadedCorrectly, { command: `[${commandType}/${localCmd.appData.name}]` })}.`);
        };
    };

    //Salta una línea en la consola
    console.log('\n');
};

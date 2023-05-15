//Exporta una función para cargar los comandos del bot en la API
export async function loadCommands() {

    //Crea colecciones para almacenar los comandos
    client.commands = { chatCommands: {}, messageCommands: {}, userCommands: {} };
    Object.keys(client.commands).forEach(x => client.commands[x] = new client.Collection());

    //Almacena los comandos registrados globalmente
    const clientCommands = await client.application.commands.fetch();

    //Almacena los comandos registrados en la baseGuild
    const guildCommands = await client.baseGuild.commands.fetch();

    //Almacena el nombre seleccionado para los comandos 
    let localeForNames = client.locale;

    //Almacena el locale al que se fuerzan las traducciones de los comandos
    const forceNameLocale = await client.functions.db.getConfig('commands.forceNameLocale');

    //Si se ha seleccionado un locale diferente
    if (forceNameLocale && forceNameLocale.length > 0) {

        //Almacena los nombres originales de los archivos
        let localeFiles = fs.readdirSync('./locales/');

        //Almacena los nombres sin extensión
        let availableLocales = [];
        
        //Para cada archivo, almacena su nombre sin extensión en el array "availableLocales"
        for (let file = 0; file < localeFiles.length; file ++) availableLocales.push(localeFiles[file].replace('.json', ''));

        //Si hay un locale con ese nombre
        if (availableLocales.includes(forceNameLocale)) {

            //Reemplaza los nombres de los comandos por los de ese locale
            localeForNames = require(`./locales/${forceNameLocale}.json`);
        };
    };

    //Almacena la configuración local de comandos
    const commandsConfig = await client.functions.db.getConfig('commands');

    //Carga de comandos - Lee el directorio de las categorías de comandos
    for (const commandType of await fs.readdirSync('./handlers/commands/')) {

        //Crea un objeto para registrar los comandos
        const localCommands = {};

        //Lee el directorio de las categorías de comandos
        for (const commandType of await fs.readdirSync('./handlers/commands/')) {

            //Para cada directorio de comandos (directorios por cada tipo), lee los comandos que contiene
            for (const commandName of await fs.readdirSync(`./handlers/commands/${commandType}/`)) {

                //Sube al objeto de comando, una relación entre el nombre localizado y el nombre de archivo
                const commandLocalizedName = commandType === 'chatCommands' ? localeForNames.handlers.commands[commandType][commandName].appData.name : client.locale.handlers.commands[commandType][commandName].appData.name;
                localCommands[commandLocalizedName] = commandName;
            };
        };

        //Almacena los nombres de los comandos ignorados
        const ignoredCommands = await client.functions.db.getConfig('commands.ignored');

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
                    await client.baseGuild.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] un-registered at ${client.baseGuild.name}`);

                } else {

                    //Borra el comando del cliente y lo notifica
                    await client.application.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] un-registered globally`);
                };

            } else {

                //Requiere el comando para obtener su información
                const importedCommand = await import(`../../handlers/commands/${commandType}/${localCommands[command[1].name]}/${localCommands[command[1].name]}.js`);
                const appType = importedCommand.config.type;

                //Si es un comando de guild pero el tipo local ya no coincide
                if (command[1].guildId && appType !== 'guild') {

                    //Lo borra y lo notifica
                    await client.baseGuild.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] converted to \"global\" type`);

                //Si es un comando global pero el tipo local ya no coincide
                } else if (!command[1].guildId && appType === 'guild') {

                    //Lo borra y lo notifica
                    await client.application.commands.delete(command[1]);
                    logger.debug(`Command [${commandType}/${command[1].name}] converted to \"guild\" type`);
                };
            };
        };

        //Para cada directorio de comandos (directorios por cada tipo), lee los comandos que contiene
        for (const commandName of await fs.readdirSync(`./handlers/commands/${commandType}/`)) {

            //Requiere el comando para obtener su información
            let importedCommandData = await import(`../../handlers/commands/${commandType}/${commandName}/${commandName}.js`);

            //Genera un objeto para almacenar los datos del comando
            let commandData = {};

            //Por cada una de las propiedades del módulo importado, las recrea en el objeto de de datos del comando
            for (const key in importedCommandData) commandData[key] = importedCommandData[key];

            //Almacena la configuración local del comando
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
                    option.name = optionLocale.name.toLowerCase().replaceAll(' ', '_');
                    option.description = optionLocale.description.length > 100 ? `${optionLocale.description.slice(0, 96)} ...` : optionLocale.description.trimEnd();

                    //Elimina el campo de "optionName" provisional
                    delete option.optionName;

                    //Por cada una de las opciones anidadas
                    if (option.options) for (const nestedOption of option.options) {

                        //Almacena la traducción de la opción
                        const nestedOptionLocale = optionLocale.options[nestedOption.optionName];

                        //Sobreescribe el campo de nombre y el de descripción
                        nestedOption.name = nestedOptionLocale.name.toLowerCase().replaceAll(' ', '_');
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
            const userConfig = commandsConfig[commandType][commandName];

            //Omite si el comando no tiene fichero de configuración
            if (!userConfig) {
                logger.warn(`Command [${commandType}/${commandName}] has no configuration in commands.json`);
                continue;
            };

            //Comprueba si hay conflictos con otros comandos que tengan el mismo nombre
            for (const type of Object.keys(client.commands)) {
                if (client.commands[type].get(localCmd.appData.name)) {
                    logger.warn(`Two or more commands have the same name: ${localCmd.appData.name}`);
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
                    
                    logger.warn(`The command [${commandType}/${commandName}] does not have a valid type`);
                    continue;
                };

                //Almacena el manager de comandos adecuado en función del tipo de comando
                const commandsManager = localCmd.type === 'global' ? client.application.commands : client.baseGuild.commands

                //Registra el comando en el manager
                await commandsManager.create({
                    name: localCmd.appData.name,
                    description: localCmd.appData.description,
                    type: localCmd.appData.type,
                    options: localCmd.appData.options,
                    defaultMemberPermissions: localCmd.defaultMemberPermissions,
                    dmPermission: localCmd.dmPermission
                });

                //Almacena el mensaje para la confirmación
                const logString = localCmd.type === 'global' ? 
                    `Command [${commandType}/${localCmd.appData.name}] registered globally` :
                    `Command [${commandType}/${localCmd.appData.name}] registered in ${client.baseGuild.name}`;
                
                //Envía un mensaje de confirmación por consola
                logger.debug(`${logString}`);

            } else {

                //Requiere "lodash" para comparar objetos
                let lodash = require('lodash');

                //Elimina las claves nulas o indefinidas de las opciones remotas
                let remoteCmdOptions = await client.functions.utils.isArrOfObjNil(remoteCmd.options, lodash);

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
                    logger.debug(`The command [${commandType}/${localCmd.appData.name}] has updated its parameters`);
                };

                //Comprueba si el permiso por defecto almacenado es el mismo que el registrado
                if (remoteCmd.defaultMemberPermissions?.bitfield !== localCmd.defaultMemberPermissions?.bitfield) {
                    
                    //Actualiza el permiso por defecto
                    await remoteCmd.edit({
                        defaultMemberPermissions: localCmd.defaultMemberPermissions
                    });
    
                    //Envía un mensaje de confirmación por consola
                    logger.debug(`The command [${commandType}/${localCmd.appData.name}] has updated its default member permissions`);
                };

                //Comprueba si el permiso de uso mediante MD es el mismo que el registrado
                if (remoteCmd.dmPermission !== localCmd.dmPermission) {
                    
                    //Actualiza el permiso de uso mediante MD
                    await remoteCmd.edit({
                        dmPermission: localCmd.dmPermission
                    });
    
                    //Envía un mensaje de confirmación por consola
                    logger.debug(`The command [${commandType}/${localCmd.appData.name}] has updated its permission to be used via DM`);
                };
            };

            //Almacena la config. de usuario del comando en los datos del comando
            commandData.userConfig = userConfig;

            //Almacena el nombre del archivo del comando en los datos del comando
            commandData.fileName = commandName;

            //Añade el comando a la colección
            await client.commands[commandType].set(localCmd.appData.name, commandData);

            //Manda un mensaje de confirmación
            logger.debug(`Command [${commandType}/${localCmd.appData.name}] loaded successfully`);
        };
    };
};

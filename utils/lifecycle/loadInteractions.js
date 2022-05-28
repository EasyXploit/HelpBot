
exports.run = async (client, forceUpdate) => {

    //Salta una línea en la consola
    console.log('\n');

    //Creación de colecciones para almacenar los comandos
    client.commands = { chatCommands: {}, messageCommands: {}, userCommands: {} };
    Object.keys(client.commands).forEach(x => client.commands[x] = new client.Collection());

    //Almacena los comandos registrados globalmente
    const clientCommands = await client.application.commands.fetch();

    //Almacena los comandos registrados en la homeGuild
    const guildCommands = await client.homeGuild.commands.fetch();

    //Carga de comandos - Lee el directorio de las categorías de comandos
    for (const commandType of await client.fs.readdirSync('./interactions/')) {

        //Para cada directorio de comandos (directorios por cada tipo), lee los comandos que contiene
        for (const commandName of await client.fs.readdirSync(`./interactions/${commandType}/`)) {

            //Requiere el comando para obtener su información
            const pulledCommand = await require(`../../interactions/${commandType}/${commandName}/${commandName}.js`);
            const localCmdConfig = pulledCommand.config;

            //Verifica si el nombre del comando es una cadena o no, y verifica si existe
            if (localCmdConfig.appData && typeof (localCmdConfig.appData.name) !== 'string') {
                console.log(`Error al cargar el comando en /interactions/chatCommands/${subDirectory}/. Falta config.name o config.name no es una cadena.`);
                continue;
            }

            //Almacena la configuración del comando
            const commandConfig = client.config[commandType][localCmdConfig.appData.name];

            //Omite si el comando no tiene fichero de configuración
            if (!commandConfig) {
                console.log(` - [ERROR] ${commandType}/${localCmdConfig.appData.name} sin config. en ${commandType}.json.`);
                continue;
            } 

            //Comprueba si hay conflictos con otros comandos que tengan el mismo nombre
            for (const type of Object.keys(client.commands)) {
                if (client.commands[type].get(localCmdConfig.appData.name)) {
                    console.warn(`Dos comandos o más comandos tienen el mismo nombre: ${localCmdConfig.appData.name}.`);
                    continue;
                }
            };

            //Almacena el comando
            let remoteCmdConfig;

            //Comprueba si es un comando global o de guild
            if (localCmdConfig.type === 'global') {

                //Si es global, busca el comando en el cliente
                remoteCmdConfig = await clientCommands.find(remoteCmdConfig => remoteCmdConfig.name === localCmdConfig.appData.name);

            } else if (localCmdConfig.type === 'guild') {

                //Si es de guild, busca el comando en la homeGuild
                remoteCmdConfig = await guildCommands.find(remoteCmdConfig => remoteCmdConfig.name === localCmdConfig.appData.name);
            };

            //Comprueba si el comando está registrado o no
            if (!remoteCmdConfig) {

                //Comprueba si es un comando global o de guild
                if (localCmdConfig.type === 'global') {

                    //Registra el comando en el cliente
                    await client.application.commands.create({
                        name: localCmdConfig.appData.name,
                        description: localCmdConfig.appData.description,
                        type: localCmdConfig.appData.type,
                        options: localCmdConfig.appData.options,
                        defaultPermission: commandConfig.defaultPermission
                    });

                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${commandType}/${localCmdConfig.appData.name} registrado en el cliente.`);

                } else if (localCmdConfig.type === 'guild') {

                    //Registra el comando en la guild
                    await client.homeGuild.commands.create({
                        name: localCmdConfig.appData.name,
                        description: localCmdConfig.appData.description,
                        type: localCmdConfig.appData.type,
                        options: localCmdConfig.appData.options,
                        defaultPermission: commandConfig.defaultPermission
                    });

                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${commandType}/${localCmdConfig.appData.name} registrado en ${client.homeGuild.name}.`);
                };

            } else {

                //Requiere "lodash" para comparar objetos
                let lodash = require('lodash');

                //Elimina las claves nulas o indefinidas de las opciones remotas
                let remoteConfigOptions = lodash.omitBy(remoteCmdConfig.options[0], lodash.isNil);

                //Si hay opciones locales, las almacena, sino crea un objeto vacío
                const localConfigOptions = localCmdConfig.appData.options ? localCmdConfig.appData.options[0] : {};

                //Si las opciones remotas tiene selecciones
                if (remoteConfigOptions.choices && remoteConfigOptions.choices.length > 0) {

                    //Almacena un array con las saelecciones modificadas
                    let newChoices = [];

                    //Por cada una de las selecciones
                    await remoteConfigOptions.choices.forEach(choice => {

                        //Elimina las claves nulas o indefinidas y sube al array de opciones modificadas
                        newChoices.push(lodash.omitBy(choice, lodash.isNil));
                    });

                    //Sustituye las selecciones remotas, por las modificadas
                    remoteConfigOptions.choices = newChoices;
                }
    
                //Comprueba si los detalles son los mismos
                if (remoteCmdConfig.description !== (localCmdConfig.appData.description || '') || remoteCmdConfig.type !== localCmdConfig.appData.type || !lodash.isEqual(remoteConfigOptions, localConfigOptions || {}) || forceUpdate) {

                    //Si no lo son, registra el cambio
                    await remoteCmdConfig.edit({
                        name: localCmdConfig.appData.name,
                        description: localCmdConfig.appData.description,
                        type: localCmdConfig.appData.type,
                        options: localCmdConfig.appData.options
                    });
    
                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${commandType}/${localCmdConfig.appData.name} [detalles/opciones] actualizados correctamente.`);
                };

                //Comprueba si el permiso por defecto almacenado es el mismo que el registrado
                if (remoteCmdConfig.defaultPermission !== commandConfig.defaultPermission || forceUpdate) {
                    
                    //Actualiza el permiso por defecto
                    await remoteCmdConfig.edit({
                        defaultPermission: commandConfig.defaultPermission
                    });
    
                    //Envía un mensaje de confirmación por consola
                    console.log(` - [UP] ${commandType}/${localCmdConfig.appData.name} [permisos por defecto] actualizados correctamente.`);
                };
    
                //Si se trata de un comando de guild
                if (localCmdConfig.type === 'guild') {
    
                    //Crea una variable para almacenar los permisos del comando en la guild
                    let fetchedPermissions;
    
                    //Si existen permisos para ese comando, los almacena
                    try {
                        fetchedPermissions = await client.homeGuild.commands.permissions.fetch({ command: remoteCmdConfig.id });
                    } catch {
                        fetchedPermissions = [];
                    };
                };
            };

            //Añade el comando a la colección
            await client.commands[commandType].set(localCmdConfig.appData.name, pulledCommand);

            //Manda un mensaje de confirmación
            console.log(` - [OK] ${commandType}/${localCmdConfig.appData.name} cargado correctamente.`);
        };

        //Crea un objeto para registrar los comandos
        const registeredCommands = {};

        //Lee el directorio de las categorías de comandos
        for (const commandType of await client.fs.readdirSync('./interactions/')) {

            //Para cada directorio de comandos (directorios por cada tipo), lee los comandos que contiene
            for (const commandName of await client.fs.readdirSync(`./interactions/${commandType}/`)) {

                //Sube al objeto de comando, una relación entre el nombre registrado y el nombre de archivo
                const pulledCommand = await require(`../../interactions/${commandType}/${commandName}/${commandName}.js`);
                registeredCommands[pulledCommand.config.appData.name] = commandName;
            };
        };

        //Almacena los nombres de los comandos ignorados
        const ignoredCommands = client.config.interactions.ignored;

        //Para cada comando de cliente
        for (const command of clientCommands) {

            //Comprueba si el tipo de comando coincide con la config. local, y no es un comando a ignorar
            if (command[1].type === 'CHAT_INPUT' && (commandType !== 'chatCommands' || ignoredCommands.chatCommands.includes(command[1].name))) continue;
            if (command[1].type === 'MESSAGE' && (commandType !== 'messageCommands' || ignoredCommands.messageCommands.includes(command[1].name))) continue;
            if (command[1].type === 'USER' && (commandType !== 'userCommands' || ignoredCommands.userCommands.includes(command[1].name))) continue;

            //Si el comando no existe localmente, lo borra
            if (!Object.keys(registeredCommands).includes(command[1].name)) {
                await client.application.commands.delete(command[1]);
                console.log(` - [UP] ${commandType}/${command[1].name} des-registrado en ${client.homeGuild.name}.`);
            } else {

                //Requiere el comando para obtener su información
                const appType = await require(`../../interactions/${commandType}/${registeredCommands[command[1].name]}/${registeredCommands[command[1].name]}.js`).config.type;

                //Si el comando ya no es de tipo "global"
                if (appType === 'guild') {
                    await client.application.commands.delete(command[1]);
                    console.log(` - [UP] ${commandType}/${command[1].name} convertido al tipo "guild".`);
                };
            };
        };

        //Para cada comando de guild
        for (const command of guildCommands) {

            //Comprueba si el tipo de comando coincide con la config. local, y no es un comando a ignorar
            if (command[1].type === 'CHAT_INPUT' && (commandType !== 'chatCommands' || ignoredCommands.chatCommands.includes(command[1].name))) continue;
            if (command[1].type === 'MESSAGE' && (commandType !== 'messageCommands' || ignoredCommands.messageCommands.includes(command[1].name))) continue;
            if (command[1].type === 'USER' && (commandType !== 'userCommands' || ignoredCommands.userCommands.includes(command[1].name))) continue;

            //Si el comando no existe localmente, lo borra
            if (!Object.keys(registeredCommands).includes(command[1].name)) {
                await client.homeGuild.commands.delete(command[1]);
                console.log(` - [UP] ${commandType}/${command[1].name} des-registrado en ${client.homeGuild.name}.`);
            } else {

                //Requiere el comando para obtener su información
                const appType = await require(`../../interactions/${commandType}/${registeredCommands[command[1].name]}/${registeredCommands[command[1].name]}.js`).config.type;

                //Si el comando ya no es de tipo "guild"
                if (appType !== 'guild') {
                    await client.homeGuild.commands.delete(command[1]);
                    console.log(` - [UP] ${commandType}/${command[1].name} convertido al tipo "global".`);
                };;
            }
        };
    };

    //Salta una línea en la consola
    console.log('\n');
};

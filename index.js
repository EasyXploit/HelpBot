//Almacena el idioma configurado
const language = require('./configs/main.json').language;

//Almacena las traducciones al idioma configurado
const locale = require(`./resources/locales/${language}.json`);

//Muestra el logo de arranque en la consola
require('./utils/splashLogo.js').run(locale.utils.splashLogo);

//CARGA DE CLIENTE
//Carga una nueva instancia de cliente en Discord
console.log(`${locale.index.startingClient} ...`);
const discord = require('discord.js');  //Carga el wrapper para interactuar con la API de Discord
const client = new discord.Client({     //Inicia el cliente con el array de intentos necesarios
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MESSAGES,
        discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_BANS,
        discord.Intents.FLAGS.DIRECT_MESSAGES,
        discord.Intents.FLAGS.GUILD_VOICE_STATES],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    retryLimit: Infinity 
});
console.log(`${locale.index.clientStarted}\n`);

//CARGA DE ESTRUCTURAS ADICIONALES
//Carga de módulos, objetos y colecciones en el cliente
['MessageEmbed', 'MessageAttachment', 'Collection'].forEach(x => client[x] = discord[x]);       //Carga de métodos de Discord.js en el cliente
['config', 'db', 'usersVoiceStates', 'reproductionQueues'].forEach(x => client[x] = {});        //Creación de objetos para almacenar las configuraciones, bases de datos y cachés
['commands', 'aliases', 'cooldownedUsers'].forEach(x => client[x] = new client.Collection());   //Creación de colecciones para comandos, alias y cooldowns

//Gestión de promesas rechazadas y no manejadas
process.on('unhandledRejection', error => {

    //Omite determinados errores que no se espera manejar
    if (!error.toString().includes('Cannot send messages to this user') && !error.toString().includes('Unknown Message')) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.index.unhandledRejection.consoleMsg}:`, error.stack);

        //Almacena el string del error, y lo recorta si es necesario
        const errorString = error.stack.length > 1014 ? `${error.stack.slice(0, 1014)} ...` : error.stack;

        //Ejecuta el manejador de depuración
        if (client.functions) client.functions.debuggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.debugging)
            .setTitle(`📋 ${locale.index.unhandledRejection.debuggingEmbed.title}`)
            .setDescription(locale.index.unhandledRejection.debuggingEmbed.description)
            .addField(locale.index.unhandledRejection.debuggingEmbed.date, `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField(locale.index.unhandledRejection.debuggingEmbed.error, `\`\`\`${errorString}\`\`\``)
            .setFooter({ text: locale.index.unhandledRejection.debuggingEmbed.footer })
        );
    };
});

//Dependencia de acceso al sistema de archivos
client.fs = require('fs');

//Carga las traducciones en el cliente
client.locale = locale;

//Carga los archivos de configuración y bases de datos
const configFiles = client.fs.readdirSync('./configs/', { withFileTypes: true });
const databaseFiles = client.fs.readdirSync('./databases/', { withFileTypes: true });

//Por cada uno de los archivos de config.
configFiles.forEach(async file => {

    //Almacena la configuración en memoria
    client.config[file.name.replace('.json', '')] = require(`./configs/${file.name}`);
});

//Por cada uno de los archivos de BD
databaseFiles.forEach(async file => {

    //Almacena la base de datos en memoria
    client.db[file.name.replace('.json', '')] = JSON.parse(client.fs.readFileSync(`./databases/${file.name}`));
});

//MANEJADOR DE EVENTOS
//Lee el directorio de los eventos
client.fs.readdir('./events/', async (err, files) => {

    //Si se genera un error, aborta la carga del resto de eventos
    if (err) return console.error(`${new Date().toLocaleString()} 》${client.locale.index.uncompleteEventsLoad}.`, error.stack);
    
    //Precarga cada uno de los eventos
    files.forEach(file => {

        const eventFunction = require(`./events/${file}`);  //Almacena la función del evento
        const eventName = file.split('.')[0];               //Almacena el nombre del evento

        //Añade un listener para el evento en cuestión (usando spread syntax)
        client.on(eventName, (...arguments) => eventFunction.run(...arguments, client, client.locale.events[eventName]));

        //Notifica la carga en la consola
        console.log(` - [OK] ${client.locale.index.eventLoaded}: [${eventName}]`);
    });
});

//MANEJADOR DE COMANDOS
//Lee el directorio de las categorías de comandos
client.fs.readdirSync('./commands/').forEach(subDirectory => {

    //Por cada subdirectorio, filtra los scripts de comandos
    const commands = client.fs.readdirSync(`./commands/${subDirectory}/`).filter(files => files.endsWith('.js'));

    //Para cada comando de la categoría
    commands.forEach(command => {

        //Requiere el comando para obtener su información
        let pulledCommand = require(`./commands/${subDirectory}/${command}`);
        
        //Verifica si el nombre del comando es una cadena o no, y verifica si existe
        if (pulledCommand.config && typeof (pulledCommand.config.name) === 'string') {

            //Carga la categoría en el objeto de config. del comando
            pulledCommand.config.category = subDirectory;

            //Comprueba si hay conflictos con otros comandos que tengan el mismo nombre
            if (client.commands.get(pulledCommand.config.name)) return console.warn(`${client.locale.index.conflictedNames}: ${pulledCommand.config.name}.`);

            //Añade el comando a la colección
            client.commands.set(pulledCommand.config.name, pulledCommand);

            //Manda un mensaje de confirmación
            console.log(` - [OK] ${client.locale.index.commandLoaded}: [${pulledCommand.config.name}]`);

        } else {
            
            //Si hay un error, no carga el comando
            return console.log(`${client.locale.index.configError}: ./commands/${subDirectory}/.`);
        };

        //Comprueba si el comando tiene alias, y de ser así, los añade a la colección
        if (pulledCommand.config.aliases && typeof (pulledCommand.config.aliases) === 'object') {

            //Por cada uno de los alias del comando
            pulledCommand.config.aliases.forEach(alias => {

                //Comprueba si hay conflictos con otros alias que tengan el mismo nombre
                if (client.aliases.get(alias)) return console.warn(`${client.locale.index.conflictedAlias}: ${alias}`);

                //Añade el alias a la colección
                client.aliases.set(alias, pulledCommand.config.name);
            });
        };

        //Almacena la configuración del comando, si existe
        const commandConfig = client.config.commands[pulledCommand.config.name];

        //Comprueba si el comando tiene alias adicionales configurados, y de ser así, los añade a la colección
        if (commandConfig && commandConfig.additionalAliases && typeof (commandConfig.additionalAliases) === 'object') {

            //Por cvada uno de los alias adicionales
            commandConfig.additionalAliases.forEach(alias => {

                //Comprueba si hay conflictos con otros alias que tengan el mismo nombre
                if (client.aliases.get(alias)) return console.warn(`${client.locale.index.conflictedAlias}: ${alias}`);

                //Añade el alias adicional a la colección general de alias
                client.aliases.set(alias, pulledCommand.config.name);
            });
        };
    });
});

//Inica sesión en el cliente
console.log(`\n- ${client.locale.index.loggingIn} ...\n`);
client.login(client.config.token.key).then(() => console.log(`\n - ${client.locale.index.loggedIn}`));

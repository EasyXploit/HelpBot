//Almacena las traducciones al idioma configurado
const locale = require(`./resources/locales/${require('./configs/main.json').locale}.json`);

//Muestra el logo de arranque en la consola
require('./lifecycle/splashLogo.js').run(locale.lifecycle.splashLogo);

//Si está habilitada, carga el manejador de errores remoto
const errorTrackingEnabled = require('./configs/errorTracker.json').enabled ? require('./lifecycle/loadErrorTracker.js').run(locale.lifecycle.loadErrorTracker) : false;

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

//Si se ha cargado el manejador de errores remoto, almacena la librería en el cliente
if (errorTrackingEnabled) client.errorTracker = require('@sentry/node');

//CARGA DE ESTRUCTURAS ADICIONALES
//Carga de módulos, objetos y colecciones en el cliente
['MessageEmbed', 'MessageAttachment', 'MessageActionRow', 'MessageSelectMenu', 'TextInputComponent', 'MessageButton', 'Collection', 'Modal'].forEach(x => client[x] = discord[x]);       //Carga de métodos de Discord.js en el cliente
['config', 'db', 'usersVoiceStates', 'memberMessages'].forEach(x => client[x] = {});                                                          //Creación de objetos para almacenar las configuraciones, bases de datos y cachés

//Dependencia para generar hashes MD5
client.md5 = require('md5');

//Gestión de promesas rechazadas y no manejadas
process.on('unhandledRejection', error => {

    //Omite determinados errores que no se espera manejar
    if (!error.toString().includes('Cannot send messages to this user') && !error.toString().includes('Unknown Message')) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.index.unhandledRejection.consoleMsg}:`, error.stack);
    };
});

//Almacena en el cliente el idioma preferido
client.locale = locale;

//Dependencia de acceso al sistema de archivos
client.fs = require('fs');

//Carga los archivos de configuración, bases de datos y locales
const configFiles = client.fs.readdirSync('./configs/', { withFileTypes: true });
const databaseFiles = client.fs.readdirSync('./storage/databases/', { withFileTypes: true });

//Por cada uno de los archivos de config.
configFiles.forEach(async file => {

    //Almacena la configuración en memoria
    client.config[file.name.replace('.json', '')] = require(`./configs/${file.name}`);
});

//Por cada uno de los archivos de BD
databaseFiles.forEach(async file => {

    //Almacena la base de datos en memoria
    client.db[file.name.replace('.json', '')] = JSON.parse(client.fs.readFileSync(`./storage/databases/${file.name}`));
});

//MANEJADOR DE EVENTOS
//Lee el directorio de los eventos
client.fs.readdir('./handlers/events/', async (error, files) => {

    //Si se genera un error, aborta la carga del resto de eventos
    if (error) return console.error(`${new Date().toLocaleString()} 》${locale.index.uncompleteEventsLoad}.`, error.stack);
    
    //Precarga cada uno de los eventos
    files.forEach(file => {

        const eventFunction = require(`./handlers/events/${file}`);  //Almacena la función del evento
        const eventName = file.split('.')[0];               //Almacena el nombre del evento

        //Añade un listener para el evento en cuestión (usando spread syntax)
        client.on(eventName, (...arguments) => eventFunction.run(...arguments, client, locale.handlers.events[eventName]));

        //Notifica la carga en la consola
        console.log(` - [OK] ${locale.index.eventLoaded}: [${eventName}]`);
    });
});

//Inica sesión en el cliente
console.log(`\n- ${locale.index.loggingIn} ...\n`);
client.login(client.config.token.key)
    .then(() => console.log(`\n - ${locale.index.loggedIn}\n`))
    .catch(() => console.error(`\n - ${locale.index.couldNotLogIn}\n`));

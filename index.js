//Carga las variables de entorno desde el fichero .env (si existe)
require('dotenv').config();

//Si la variable de entorno "NODE_ENV" no está establecida, la establece en modo de desarrollo
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

//Carga el manejador de logs
require('./lifecycle/loadLogger.js').run();

//Almacena la configuración local desde el fichero de configuración
const localConfig = require('./config.json');

//Almacena las traducciones al idioma configurado
let locale = require(`./resources/locales/${localConfig.locale}.json`);

//Uniforma las traducciones si no se corresponden con las del idioma por defecto
locale = require('./lifecycle/loadLocales.js').run(localConfig.locale);

//Gestión de promesas rechazadas y no manejadas
process.on('unhandledRejection', error => {

    //Omite determinados errores que no se espera manejar
    if (!error.toString().includes('Cannot send messages to this user') && !error.toString().includes('Unknown Message')) {

        //Envía un mensaje de error a la consola
        logger.error(`Unhandled rejected promise: ${error.stack}`);
    };
});

//Muestra el logo de arranque en la consola
require('./lifecycle/splashLogo.js').run(locale.lifecycle.splashLogo);

//
logger.info(`》${locale.index.startupMsg} ...`);

//Carga el manejador de errores remoto, si está habilitado
if (localConfig.errorTrackingStatus) require('./lifecycle/loadErrorTracker.js').run();

//Ejecuta el cargador de la base de datos
require('./lifecycle/loadDatabase.js').run(locale);

//Carga el wrapper para interactuar con la API de Discord
const discord = require('discord.js');

//Indica el inicio de la carga del cliente en la consola
logger.debug('Starting the client ...');

//Carga una nueva instancia de cliente de Discord
const client = new discord.Client({
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

//Indica la finalización de la carga del cliente en la consola
logger.debug('Client started successfully!');

//Almacena la librería del manejador de errores remoto en el cliente 
client.errorTracker = require('@sentry/node');

//Almacena la librería para generar hashes MD5 en el cliente 
client.md5 = require('md5');

//Almacena la librería de acceso al sistema de archivos en el cliente
client.fs = require('fs');

//Almacena el la configuración local en el cliente
client.localConfig = localConfig;

//Almacena el idioma preferido en el cliente
client.locale = locale;

//Carga varios métodos de Discord.js en el cliente
['MessageEmbed', 'MessageAttachment', 'MessageActionRow', 'MessageSelectMenu', 'TextInputComponent', 'MessageButton', 'Collection', 'Modal', 'Permissions'].forEach(x => client[x] = discord[x]);

//Crea varios objetos en el cliente para almacenar las configuraciones, bases de datos, cachés y funciones, entre otros
['functions', 'config', 'db', 'usersVoiceStates', 'userMessages'].forEach(x => client[x] = {});

//Carga las funciones globales en el cliente
require('./lifecycle/loadFunctions.js').run(client);

//Carga los archivos de configuración (heredado)
const configFiles = client.fs.readdirSync('./configs/', { withFileTypes: true });

//Por cada uno de los archivos de config.
configFiles.forEach(async file => {

    //Almacena la configuración en memoria
    client.config[file.name.replace('.json', '')] = require(`./configs/${file.name}`);
});

//Carga los archivos de bases de datos (deprecado)
const databaseFiles = client.fs.readdirSync('./storage/databases/', { withFileTypes: true });

//Por cada uno de los archivos de BD
databaseFiles.forEach(async file => {

    //Almacena la base de datos en memoria
    client.db[file.name.replace('.json', '')] = JSON.parse(client.fs.readFileSync(`./storage/databases/${file.name}`));
});

//Carga los manejadores de eventos
require('./lifecycle/loadEvents.js').run(client);

//Carga el manejador de inicio de sesión
require('./lifecycle/login.js').run(client);

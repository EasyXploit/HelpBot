//Importa globalmente la capacidad de requerir módulos CommonJS
import { createRequire } from 'module';
global.require = createRequire(import.meta.url);

//Carga las variables de entorno desde el fichero .env (si existe)
require('dotenv').config();

//Importa globalmente la capacidad de acceder al sistema de archivos
import * as fs from 'fs';
global.fs = fs;

//Si la variable de entorno "NODE_ENV" no está establecida, la establece en modo de desarrollo
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

//Importa los cargadores
import { loadLogger, loadLocales, splashLogo, loadErrorTracker, loadDatabase, loadFunctions, loadEvents, login } from 'helpbot/loaders';

//Carga el manejador de logs
await loadLogger();

//Almacena la configuración local desde el fichero de configuración
const localConfig = require('./config.json');

//Carga el manejador de errores remoto, si está habilitado
if (localConfig.errorTrackingStatus) loadErrorTracker();

//Almacena las traducciones al idioma configurado
let locale = await require(`./locales/${localConfig.locale}.json`);

//Uniforma las traducciones si no se corresponden con las del idioma por defecto
locale = await loadLocales(localConfig.locale);

//Gestión de promesas rechazadas y no manejadas
process.on('unhandledRejection', error => {

    //Omite determinados errores que no se espera manejar
    if (error.toString().includes('Cannot send messages to this user') || error.toString().includes('Unknown Message')) return;

    //Envía un mensaje de error a la consola
    logger.error(`Unhandled rejected promise: ${error.stack}`);
});

//Muestra el logo de arranque en la consola
await splashLogo(locale.lifecycle.splashLogo);

//Indica que el bot se está iniciando
logger.info(`${locale.index.startupMsg} ...`);

//Ejecuta el cargador de la base de datos
await loadDatabase();

//Carga globalmente el wrapper para interactuar con la API de Discord
global.discord = require('discord.js');

//Indica el inicio de la carga del cliente en la consola
logger.debug('Starting the client');

//Carga una nueva instancia de cliente de Discord
global.client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.GuildMessageReactions,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildBans,
        discord.GatewayIntentBits.DirectMessages,
        discord.GatewayIntentBits.GuildVoiceStates],
    partials: [
        discord.Partials.Message, 
        discord.Partials.Channel, 
        discord.Partials.Reaction
    ],
    retryLimit: Infinity 
});

//Indica la finalización de la carga del cliente en la consola
logger.debug('Client started successfully');

//Almacena la librería del manejador de errores remoto en el cliente 
client.errorTracker = require('@sentry/node');

//Almacena la librería para generar hashes MD5 en el cliente 
client.md5 = require('md5');

//Almacena el la configuración local en el cliente
client.localConfig = localConfig;

//Almacena el idioma preferido en el cliente
client.locale = locale;

//Carga las funciones globales en el cliente
await loadFunctions();

//Carga los manejadores de eventos
await loadEvents();

//Carga el manejador de inicio de sesión
await login();

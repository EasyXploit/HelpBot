// Globally imports the ability to require CommonJS modules
import { createRequire } from 'module';
global.require = createRequire(import.meta.url);

// Stores the global availability status of the bot
global.readyStatus = false;

// Loads the environment variables from the .env file (if it exists)
require('dotenv').config();

// Globally imports the ability to access the file system
import * as fs from 'fs';
global.fs = fs;

// If the "NODE_ENV" environment variable is not established, it establishes it in development mode
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

// Imports the loaders
import { loadLogger, loadLocales, splashLogo, loadErrorTracker, loadDatabase, loadFunctions, loadEvents, login } from 'helpbot/loaders';

// Loads the logs handler
await loadLogger();

// Stores the local configuration from the configuration file
const localConfig = require('./config.json');

// Loads the remote error handler, if enabled
if (localConfig.errorTracking.enabled || process.env.NODE_ENV !== 'production') loadErrorTracker(localConfig);

// Loads the target language from the environment variables, or from the local configuration
let targetLocale = process.env.LOCALE && process.env.LOCALE.length > 0 ? process.env.LOCALE : localConfig.locale;

// If the translation file for this language does not exist
if (!fs.existsSync(`./locales/${targetLocale}.json`)) {

    // Sends a notice to the console
    logger.warn(`There is no locale file for the selected language (${targetLocale}), so "en-US" will be used instead`);

    // Replaces the target language with the default one
    targetLocale = 'en-US';

    // If the language came by configuration
    if (!process.env.LOCALE || process.env.LOCALE.length === 0) {

        // Replaces it with the default one
        localConfig.locale = targetLocale;

        // Updates the configuration file with the changes
        fs.writeFile('./config.json', JSON.stringify(localConfig, null, 4), async err => { if (err) throw err; });

        // Sends a notice to the console
        logger.warn('The language has been replaced by the default one (en-US) in the local configuration file');
    };
};

// Stores the translations to the configured language
let locale = await require(`./locales/${targetLocale}.json`);

// Uniforms the translations if they do not correspond to those of the default language
locale = await loadLocales(targetLocale);

// Rejected and not managed promises management
process.on('unhandledRejection', error => {

    // Omits certain errors that are not expected to be handled
    if (error.toString().includes('Cannot send messages to this user') || error.toString().includes('Unknown Message')) return logger.warn(`The bot was unable to deliver a message to a user due to an API restriction`);;

    // Sends an error message to the console
    logger.error(`Unhandled rejected promise: ${error.stack}`);
});

// Shows the starting logo on the console
await splashLogo(locale.lib.loaders.splashLogo);

// Indicates that the bot is starting
logger.info(`${locale.index.startupMsg} ...`);

// Executes the database loader
await loadDatabase(localConfig);

// Globally loads the wrapper to interact with the Discord's API
global.discord = require('discord.js');

// Indicates the start of the client load on the console
logger.debug('Starting the client');

// Loads a new discord client instance
global.client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildMessageReactions,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildBans,
        discord.GatewayIntentBits.DirectMessages,
        discord.GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        discord.Partials.Message, 
        discord.Partials.Channel, 
        discord.Partials.Reaction
    ],
    retryLimit: Infinity 
});

// Indicates the completion of client loading in the console
logger.debug('Client started successfully');

// Stores the remote error handling library in the client
client.errorTracker = require('@sentry/node');

// Stores the library to generate MD5 hashes in the client
client.md5 = require('md5');

// Stores the local configuration in the client
client.localConfig = localConfig;

// Stores the preferred language in the client
client.locale = locale;

// Loads the global functions in the client
await loadFunctions();

// Loads the event managers
await loadEvents();

// Loads the login handler
await login();

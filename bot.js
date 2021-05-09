//Logo de arranque
const { splash } = require('./utils/splashLogo.js');
console.log(`${splash}\n》Iniciando aplicación «\n―――――――――――――――――――――――― \n${new Date().toLocaleString()}\n`);

//DEPENDENCIAS GLOBALES
const discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const cleverbot = require('cleverbot-free');
const keys = require('./configs/keys.json');
const client = new discord.Client({
    fetchAllMembers: true,
    disableEveryone: true,
    disabledEvents: ['TYPING_START', 'TYPING_STOP'],
    autoReconnect: true,
    retryLimit: Infinity 
});

//CONFIGURACIONES
const config = require('./configs/config.json');
const filters = require('./utils/automod/filters.json');
const commandsConfig = require('./configs/commands.json');

//CONFIGURACIONES GLOBALES
client.musicConfig = require('./configs/music.json');
client.homeGuild = config.homeGuild;

//RECURSOS GLOBALES
let resources = require('./utils/resources.js');
const automodFilters = require('./utils/automod/automodFilters.js')

//USUARIOS QUE USARON COMANDOS RECIENTEMENTE
const talkedRecently = new Set();

//DATOS PERSISTENTES
client.mutes = JSON.parse(fs.readFileSync('./storage/mutes.json', 'utf-8'));
client.bans = JSON.parse(fs.readFileSync('./storage/bans.json', 'utf-8'));
client.polls = JSON.parse(fs.readFileSync('./storage/polls.json', 'utf-8'));
client.stats = JSON.parse(fs.readFileSync('./storage/stats.json', 'utf-8'));
client.warns = JSON.parse(fs.readFileSync('./storage/warns.json', 'utf-8'));

//VOZ
client.servers = {}; //Almacena la cola y otros datos
client.voiceStatus = true; //Almacena la disponiblidad del bot
client.voiceDispatcher; //Almacena el dispatcher
client.voiceConnection; //Almacena la conexión
client.voiceTimeout; //Almacena los timeouts de reproducción finalizada
client.usersVoiceStates = {}; //Almacena los cambios de estado de voz de los usuarios

//DMs
client.dmContexts = {};

// MANEJADOR DE EVENTOS
fs.readdir('./events/', async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(`.`)[0];

        if (eventName === 'guildBanAdd') {
            client.on(eventName, (guild, user) => {
                eventFunction.run(guild, user, discord, fs, config, keys, client, resources);
            });
        } else if (eventName === 'voiceStateUpdate') {
            client.on(eventName, (oldState, newState) => {
                eventFunction.run(oldState, newState, discord, fs, config, keys, client, resources);
            });
        } else {
            client.on(eventName, event => {
                eventFunction.run(event, discord, fs, config, keys, client, resources);
            });
        }

        console.log(` - Evento [${eventName}] cargado`);
    });
    console.log('\n');
});

// Debugging
client.on(`error`, (e) => {
    if (e.message.includes(`ECONNRESET`)) return console.log(`${new Date().toLocaleString()} ERROR 》La conexión fue cerrada inesperadamente.\n`)
    console.error(`${new Date().toLocaleString()} 》ERROR: ${e.stack}`)
});

client.on(`warn`, error => console.warn(`${new Date().toLocaleString()} 》WARN: ${error.stack}`));
client.on('shardError', error => console.error('Una conexión websocket encontró un error:', error));
process.on('unhandledRejection', error => console.error(`${new Date().toLocaleString()} Rechazo de promesa no manejada:`, error));

// Inicio de sesión del bot
client.login(keys.token);

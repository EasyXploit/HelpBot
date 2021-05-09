//Logo de arranque
const { splash } = require('./utils/splashLogo.js');
console.log(`${splash}\n》Iniciando aplicación «\n―――――――――――――――――――――――― \n${new Date().toLocaleString()}\n`);

//Carga del cliente
const discord = require('discord.js');
const client = new discord.Client({
    fetchAllMembers: true,
    disableEveryone: true,
    disabledEvents: ['TYPING_START', 'TYPING_STOP'],
    autoReconnect: true,
    retryLimit: Infinity 
});

//Acceso al sistema de archivos
const fs = require('fs');

//Configuraciones globales
client.config = {
    keys: require('./configs/keys.json'),
    guild: require('./configs/guild.json'),
    automodFilters: require('./configs/automodFilters.json'),
    automodRules: require('./configs/automodRules.json'),
    prefixes: require('./configs/prefixes.json'),
    commands: require('./configs/commands.json'),
    presence: require('./configs/presence.json'),
    music: require('./configs/music.json'),
    voice: require('./configs/voice.json')
};

//Dependencias globales
client.colors = require('./resources/data/colors.json'); //Colores globales
client.cleverbot = require('cleverbot-free'); //Cleverbot
client.automodFiltering = require('./utils/automodFiltering.js'); //Filtros de moderación

//Cooldowns de los usuarios
client.cooldownedUsers = new Set();

//Bases de datos (mediante ficheros)
client.mutes = JSON.parse(fs.readFileSync('./databases/mutes.json', 'utf-8')); //Usuarios silenciados temporalmente
client.bans = JSON.parse(fs.readFileSync('./databases/bans.json', 'utf-8')); //Usuarios baneados temporalmente
client.polls = JSON.parse(fs.readFileSync('./databases/polls.json', 'utf-8')); //Encuestas en marcha
client.stats = JSON.parse(fs.readFileSync('./databases/stats.json', 'utf-8')); //Estadísticas de los miembros
client.warns = JSON.parse(fs.readFileSync('./databases/warns.json', 'utf-8')); //Advertencias de los usuarios

//Datos de voz
client.queues = {}; //Almacena la cola y otros datos
client.voiceStatus = true; //Almacena la disponiblidad del bot
client.voiceDispatcher; //Almacena el dispatcher
client.voiceConnection; //Almacena la conexión
client.voiceTimeout; //Almacena los timeouts de reproducción finalizada
client.usersVoiceStates = {}; //Almacena los cambios de estado de voz de los usuarios

//Contexto de los MDs
client.dmContexts = {};

//Manejador de eventos
fs.readdir('./events/', async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    
    //Precarga cada uno de los eventos
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(`.`)[0];

        if (eventName === 'guildBanAdd') {
            client.on(eventName, (guild, user) => {
                eventFunction.run(guild, user, discord, fs, client);
            });
        } else if (eventName === 'voiceStateUpdate') {
            client.on(eventName, (oldState, newState) => {
                eventFunction.run(oldState, newState, discord, fs, client);
            });
        } else {
            client.on(eventName, event => {
                eventFunction.run(event, discord, fs, client);
            });
        };

        console.log(` - Evento [${eventName}] cargado`);
    });
});

//DEBUGGING
client.on('error', (e) => {
    if (e.message.includes('ECONNRESET')) return console.log(`${new Date().toLocaleString()} ERROR 》La conexión fue cerrada inesperadamente.\n`)
    console.error(`${new Date().toLocaleString()} 》ERROR: ${e.stack}`)
});

client.on('warn', error => console.warn(`${new Date().toLocaleString()} 》WARN: ${error.stack}`));
client.on('shardError', error => console.error('Una conexión al websocket encontró un error:', error));
process.on('unhandledRejection', error => {
    if (!error.toLocaleString().includes('Cannot send messages to this user')) console.error(`${new Date().toLocaleString()} Rechazo de promesa no manejada:`, error);
});

//INICIO DE SESIÓN DEL BOT
client.login(client.config.keys.token);

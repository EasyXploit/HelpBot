//Gestión de promesas rechazadas y no manejadas
process.on('unhandledRejection', error => {
    if (!error.toString().includes('Cannot send messages to this user')) console.error(`${new Date().toLocaleString()} 》Rechazo de promesa no manejada:`, error);
});

//Logo de arranque
const { splash, divider } = require('./utils/splashLogo.js');
console.log(splash, divider);

//Carga del cliente
console.log('- Iniciando cliente ...');
const discord = require('discord.js');
const client = new discord.Client({
    fetchAllMembers: true,
    disableEveryone: true,
    disabledEvents: ['TYPING_START', 'TYPING_STOP'],
    autoReconnect: true,
    retryLimit: Infinity 
});
console.log('- ¡Cliente iniciado correctamente!\n');

//Configuraciones globales
client.config = {
    keys: require('./configs/keys.json'),                       //Tokens de autenticación
    guild: require('./configs/guild.json'),                     //Configuraciones de la guild base
    automodFilters: require('./configs/automodFilters.json'),   //Filtros de moderación automática
    automodRules: require('./configs/automodRules.json'),       //Reglas de moderación automática
    prefixes: require('./configs/prefixes.json'),               //Configuración de prefijos del bot
    commands: require('./configs/commands.json'),               //Configuración de comandos
    presence: require('./configs/presence.json'),               //Configuración de presencia
    music: require('./configs/music.json'),                     //Configuración de música
    xp: require('./configs/xp.json'),                           //Configuración de XP
    customEmojis: require('./configs/customEmojis.json'),       //Configuración de customEmojis
};

//Dependencias globales
client.fs = require('fs');                                          //Acceso al sistema de archivos
client.cleverbot = require('cleverbot-free');                       //API de Cleverbot
client.colors = require('./resources/data/colors.json');            //Colores globales
client.automodFiltering = require('./utils/automodFiltering.js');   //Filtros (auto-moderación)

//Datos de usuarios
client.usersVoiceStates = {};           //Cambios de estado de voz de los usuarios
client.cooldownedUsers = new Set();     //Cooldowns de los usuarios
client.dmContexts = {};                 //Contexto de los MDs

//Bases de datos (mediante ficheros)
client.bans = JSON.parse(client.fs.readFileSync('./databases/bans.json', 'utf-8'));     //Usuarios baneados temporalmente
client.mutes = JSON.parse(client.fs.readFileSync('./databases/mutes.json', 'utf-8'));   //Usuarios silenciados temporalmente
client.polls = JSON.parse(client.fs.readFileSync('./databases/polls.json', 'utf-8'));   //Encuestas en marcha
client.stats = JSON.parse(client.fs.readFileSync('./databases/stats.json', 'utf-8'));   //Estadísticas de los miembros
client.warns = JSON.parse(client.fs.readFileSync('./databases/warns.json', 'utf-8'));   //Advertencias de los usuarios

//Datos de voz
client.queues = {};         //Almacena la cola y otros datos
client.voiceStatus = true;  //Almacena la disponiblidad del bot
client.voiceDispatcher;     //Almacena el dispatcher
client.voiceConnection;     //Almacena la conexión
client.voiceTimeout;        //Almacena los timeouts de reproducción finalizada

//Manejadores de eventos
client.fs.readdir('./events/', async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    
    //Precarga cada uno de los eventos
    files.forEach(file => {
        const eventFunction = require(`./events/${file}`);
        const eventName = file.split('.')[0];

        //Pasa 2 parámetros si se trata de un enevento con dos de ellos
        if (eventName === 'guildBanAdd' || eventName === 'voiceStateUpdate') {
            client.on(eventName, (argument1, argument2) => {
                eventFunction.run(argument1, argument2, client, discord);
            });
        } else {
            client.on(eventName, event => {
                eventFunction.run(event, client, discord);
            });
        };

        console.log(` - [OK] Evento [${eventName}]`);
    });
});

//Inicio de sesión del bot
console.log('- Iniciando sesión ...\n');
client.login(client.config.keys.token).then(() => console.log('\n - ¡Sesion iniciada correctamente!'));

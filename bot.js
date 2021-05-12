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
    keys: require('./configs/keys.json'),
    guild: require('./configs/guild.json'),
    automodFilters: require('./configs/automodFilters.json'),
    automodRules: require('./configs/automodRules.json'),
    prefixes: require('./configs/prefixes.json'),
    commands: require('./configs/commands.json'),
    presence: require('./configs/presence.json'),
    music: require('./configs/music.json'),
    voice: require('./configs/voice.json'),
    emotes: require('./configs/emotes.json'),
};

//Dependencias globales
client.colors = require('./resources/data/colors.json'); //Colores globales
client.cleverbot = require('cleverbot-free'); //Cleverbot
client.automodFiltering = require('./utils/automodFiltering.js'); //Filtros de moderación
client.fs = require('fs');                                          //Acceso al sistema de archivos

//Cooldowns de los usuarios
client.cooldownedUsers = new Set();

//Bases de datos (mediante ficheros)
client.mutes = JSON.parse(client.fs.readFileSync('./databases/mutes.json', 'utf-8'));   //Usuarios silenciados temporalmente
client.bans = JSON.parse(client.fs.readFileSync('./databases/bans.json', 'utf-8'));     //Usuarios baneados temporalmente
client.polls = JSON.parse(client.fs.readFileSync('./databases/polls.json', 'utf-8'));   //Encuestas en marcha
client.stats = JSON.parse(client.fs.readFileSync('./databases/stats.json', 'utf-8'));   //Estadísticas de los miembros
client.warns = JSON.parse(client.fs.readFileSync('./databases/warns.json', 'utf-8'));   //Advertencias de los usuarios

//Datos de voz
client.queues = {}; //Almacena la cola y otros datos
client.voiceStatus = true; //Almacena la disponiblidad del bot
client.voiceDispatcher; //Almacena el dispatcher
client.voiceConnection; //Almacena la conexión
client.voiceTimeout; //Almacena los timeouts de reproducción finalizada
client.usersVoiceStates = {}; //Almacena los cambios de estado de voz de los usuarios

//Contexto de los MDs
client.dmContexts = {};

//Manejadores de eventos
client.fs.readdir('./events/', async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    
    //Precarga cada uno de los eventos
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(`.`)[0];

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


process.on('unhandledRejection', error => {
    if (!error.toLocaleString().includes('Cannot send messages to this user')) console.error(`${new Date().toLocaleString()} Rechazo de promesa no manejada:`, error);
});

//Inicio de sesión del bot
console.log('- Iniciando sesión ...\n')
client.login(client.config.keys.token).then(() => console.log('\n - ¡Sesion iniciada correctamente!'));

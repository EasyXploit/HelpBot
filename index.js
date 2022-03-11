//Gestión de promesas rechazadas y no manejadas
process.on('unhandledRejection', error => {
    if (!error.toString().includes('Cannot send messages to this user') && !error.toString().includes('Unknown Message')) {
        console.error(`${new Date().toLocaleString()} 》Promesa rechazada no manejada:`, error)
    };
});

//Logo de arranque
const { splash, divider } = require('./utils/splashLogo.js');
console.log(splash, divider);

//Carga del cliente
console.log('- Iniciando cliente ...');
const discord = require('discord.js');
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
console.log('- ¡Cliente iniciado correctamente!\n');

//Carga de librerías de métodos de Discord en el cliente
client.MessageEmbed = discord.MessageEmbed;
client.MessageAttachment = discord.MessageAttachment;

//Dependencias útiles globales
client.fs = require('fs');                                          //Acceso al sistema de archivos
client.path = require('path');                                      //Para generar rutas

//Configuraciones globales
client.config = {
    token: require('./configs/token.json'),                     //Tokens de autenticación
    main: require('./configs/main.json'),                       //Configuraciones generales
    automodFilters: require('./configs/automodFilters.json'),   //Filtros de moderación automática
    automodRules: require('./configs/automodRules.json'),       //Reglas de moderación automática
    bannedWords: require('./configs/bannedWords.json'),         //Listado de palabras prohibidas
    commands: require('./configs/commands.json'),               //Configuración de comandos
    colors: require('./configs/colors.json'),                   //Configuración de colores globales
    presence: require('./configs/presence.json'),               //Configuración de presencia
    music: require('./configs/music.json'),                     //Configuración de música
    xp: require('./configs/xp.json'),                           //Configuración de XP
    levelingRewards: require('./configs/levelingRewards.json'), //Configuración de niveles
};

//Datos de usuarios
client.usersVoiceStates = {};           //Cambios de estado de voz de los usuarios
client.cooldownedUsers = new Set();     //Cooldowns de los usuarios
client.reproductionQueues = {};         //Almacena la cola de reproducción y otros datos

//Bases de datos (mediante ficheros)
client.bans = JSON.parse(client.fs.readFileSync('./databases/bans.json', 'utf-8'));                     //Usuarios baneados temporalmente
client.mutes = JSON.parse(client.fs.readFileSync('./databases/mutes.json', 'utf-8'));                   //Usuarios silenciados temporalmente
client.polls = JSON.parse(client.fs.readFileSync('./databases/polls.json', 'utf-8'));                   //Encuestas en marcha
client.stats = JSON.parse(client.fs.readFileSync('./databases/stats.json', 'utf-8'));                   //Estadísticas de los miembros
client.warns = JSON.parse(client.fs.readFileSync('./databases/warns.json', 'utf-8'));                   //Advertencias de los usuarios

//Creación de colecciones
['commands', 'aliases'].forEach(x => client[x] = new discord.Collection());

//MANEJADOR DE EVENTOS
//Carga de eventos - Lee el directorio de los eventos
client.fs.readdir('./events/', async (err, files) => {

    if (err) return console.error(`${new Date().toLocaleString()} 》No se ha podido completar la carga de los eventos.\n${err.stack}`);
    
    //Precarga cada uno de los eventos
    files.forEach(file => {
        const eventFunction = require(`./events/${file}`);
        const eventName = file.split('.')[0];

        //Pasa 2 parámetros si se trata de un enevento con dos de ellos
        if (eventName === 'voiceStateUpdate') {
            client.on(eventName, (argument1, argument2) => {
                eventFunction.run(argument1, argument2, client);
            });
        } else {
            client.on(eventName, event => {
                eventFunction.run(event, client);
            });
        };

        console.log(` - [OK] Evento [${eventName}]`);
    });
});

//CARGADOR DE COMANDOS
//Carga de comandos - Lee el directorio de las categorías de comandos
client.fs.readdirSync('./commands/').forEach(subDirectory => {

    //Por cada subdirectorio, filtra los scripts de comandos
    const commands = client.fs.readdirSync(`./commands/${subDirectory}/`).filter(files => files.endsWith('.js'));

    //Para cada comando de la categoría
    commands.forEach(command => {

        //Requiere el comando para obtener su información
        const pulledCommand = require(`./commands/${subDirectory}/${command}`);
        
        //Verifica si el nombre del comando es una cadena o no, y verifica si existe
        if (pulledCommand.config && typeof (pulledCommand.config.name) === 'string') {

            //Comprueba si hay conflictos con otros comandos que tengan el mismo nombre
            if (client.commands.get(pulledCommand.config.name)) return console.warn(`Dos comandos o más comandos tienen el mismo nombre: ${pulledCommand.config.name}.`);

            //Añade el comando a la colección
            client.commands.set(pulledCommand.config.name, pulledCommand);

            //Manda un mensaje de confirmación
            console.log(` - [OK] Comando [${pulledCommand.config.name}]`);

        } else {
            //Si hay un error, no carga el comando
            return console.log(`Error al cargar el comando en ./commands/${subDirectory}/. Falta config.name o config.name no es una cadena.`);
        };

        //Comprueba si el comando tiene alias, y de ser así, los añade a la colección
        if (pulledCommand.config.aliases && typeof (pulledCommand.config.aliases) === 'object') {
            pulledCommand.config.aliases.forEach(alias => {

                //Comprueba si hay conflictos con otros alias que tengan el mismo nombre
                if (client.aliases.get(alias)) return console.warn(`Dos comandos o más comandos tienen los mismos alias: ${alias}`);
                client.aliases.set(alias, pulledCommand.config.name);
            });
        };

        //Almacena la configuración del comando, si existe
        const commandConfig = client.config.commands[pulledCommand.config.name];

        //Comprueba si el comando tiene alias adicionales configurados, y de ser así, los añade a la colección
        if (commandConfig && commandConfig.additionalAliases && typeof (commandConfig.additionalAliases) === 'object') {
            commandConfig.additionalAliases.forEach(alias => {

                //Comprueba si hay conflictos con otros alias que tengan el mismo nombre
                if (client.aliases.get(alias)) return console.warn(`Dos comandos o más comandos tienen los mismos alias: ${alias}`);
                client.aliases.set(alias, pulledCommand.config.name);
            });
        };
    });
});

//Inicio de sesión del bot
console.log('\n- Iniciando sesión ...\n');
client.login(client.config.token.key).then(() => console.log('\n - ¡Sesion iniciada correctamente!'));

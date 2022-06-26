//Almacena las traducciones al idioma configurado
const locale = require(`./resources/locales/${require('./configs/main.json').locale}.json`);

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
['MessageEmbed', 'MessageAttachment', 'MessageActionRow', 'TextInputComponent', 'MessageButton', 'Collection', 'Modal'].forEach(x => client[x] = discord[x]);       //Carga de métodos de Discord.js en el cliente
['config', 'db', 'usersVoiceStates', 'reproductionQueues'].forEach(x => client[x] = {});                                                                 //Creación de objetos para almacenar las configuraciones, bases de datos y cachés

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
client.fs.readdir('./handlers/events/', async (err, files) => {

    //Si se genera un error, aborta la carga del resto de eventos
    if (err) return console.error(`${new Date().toLocaleString()} 》${locale.index.uncompleteEventsLoad}.`, error.stack);
    
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
client.login(client.config.token.key).then(() => console.log(`\n - ${locale.index.loggedIn}\n`));

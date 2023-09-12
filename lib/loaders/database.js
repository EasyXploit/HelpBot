
//Exporta una función para conectarse a la BD
export async function loadDatabase(localConfig) {

    //Requiere el módulo para comunicarse con la BD
    const mongoose = require('mongoose');

    //Almacena la dependencia para registrar errores remotamente
    const errorTracker = require('@sentry/node');

    //Método para manejar variables de entorno inadecuadas
    const handleInvalidEnv = (variable) => {

        //Almacena los posibles mensajes de error
        const variableErrors = {
            target: "No database target direction has been provided",
            port: "No database port has been provided, or it is not a number",
            name: "No database name has been provided",
            authSource: "No database provided for authorization",
            username: "A username has not been provided for the database connection",
            password: "A password has not been provided for the connection to the database"
        };

        //Notifica el error por consola en función del tipo
        logger.error(`${variableErrors[variable]}. The program will stop`);

        //Aborta el proceso de manera limpia
        process.exit(1);
    };

    //Almacena los parámetros necesarios para la conexión
    const target = process.env.DB_TARGET && process.env.DB_TARGET.length > 0 ? process.env.DB_TARGET : localConfig.database.target;
    const port = process.env.DB_PORT && process.env.DB_PORT.length > 0 ? process.env.DB_PORT : localConfig.database.port;
    const name = process.env.DB_NAME && process.env.DB_NAME.length > 0 ? process.env.DB_NAME : localConfig.database.name;
    const authSource = process.env.DB_AUTH_SOURCE && process.env.DB_AUTH_SOURCE.length > 0 ? process.env.DB_AUTH_SOURCE : localConfig.database.authSource;
    const username = process.env.DB_USERNAME && process.env.DB_USERNAME.length > 0 ? process.env.DB_USERNAME : localConfig.database.username;
    const password = process.env.DB_PASSWORD && process.env.DB_PASSWORD.length > 0 ? process.env.DB_PASSWORD : localConfig.database.password;

    //Comprueba que se hayan proporcionado todos los parámetros necesarios para la conexión
    if (!target) return handleInvalidEnv('target');
    if (!port || isNaN(port)) return handleInvalidEnv('port');
    if (!name) return handleInvalidEnv('name');
    if (!authSource) return handleInvalidEnv('authSource');
    if (!username) return handleInvalidEnv('username');
    if (!password) return handleInvalidEnv('password');

    //Indica el estado inicial de la carga en la consola
    logger.debug(`Starting connection to database: ${authSource}`);

    //Genera un objeto con las opciones necesarias para la conexión
    const options = {
        authSource: authSource,     //La base de datos que contiene las credenciales del usuario 
        user: username,             //El nombre de usuario de la base de datos
        pass: password,             //La contraseña de usuario de la base de datos
        useNewUrlParser: true,      //Para usar el nuevo analizador de cadenas de conexión
        useUnifiedTopology: true,   //Habilitado porque el motor de supervisión y detección de servidores está en desuso
        autoIndex: false,           //Mongoose no creará índices automáticamente para ningún modelo asociado con esta conexión
        connectTimeoutMS: 10000,    //Cuánto tiempo esperará el controlador MongoDB antes de eliminar un socket debido a inactividad
        family: 4                   //Para conectarse usando IPv4
    };

    //Genera la URI para la conexión con la BD
    const connectionString = `mongodb://${target}:${port}/${name}`;
    
    //Se conecta a la base de datos con las opciones proporcionadas
    mongoose.connect(connectionString, options)
        .catch(error => {

            //Captura la excepción y la envía al manejador de errores remoto
            errorTracker.captureException(error);

            //Muestra un error por la consola
            logger.error(`Could not connect to the database, so the program will stop: ${error.stack}`)

            //Aborta el proceso de manera limpia
            process.exit(1);
        });

    //Hace que las promesas de Mongoose estén disponibles globalmente
    mongoose.Promise = global.Promise;

    //Cuando el bot se conecte a la base de datos
    mongoose.connection.on('connected', async () => {

        //Lo notifica en la consola
        logger.debug('Connection to the database successfully opened');

        //Si la versión del programa es de producción
        if (process.env.NODE_ENV === 'production') {

            //Notifica la migración de los documentos en la consola
            logger.debug('Checking that all DB documents have the correct version');
    
            //Migra los documentos de la base de datos a la última versión
            await client.functions.db.migrate(options, 'up');
        };
    });
    
    //Cuando el bot sufre un error de conexión con la base de datos
    mongoose.connection.on('error', error => {

        //Captura la excepción y la envía al manejador de errores remoto
        errorTracker.captureException(error);

        //Muestra un error por la consola
        logger.error(`Connection to the database error: ${error.stack}`);
    });

    //Alerta cuando el bot se desconecta de la base de datos
    mongoose.connection.on('disconnected', () => logger.warn('Connection to the database aborted. Reconnection will be attempted'));

    //Alerta cuando falla el intento de reconexión a la base de datos
    mongoose.connection.on('reconnected', () => logger.debug('Connection to the database restablished'));
};

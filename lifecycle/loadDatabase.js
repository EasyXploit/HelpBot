
//Exporta una función para conectarse a la BD
exports.run = async () => {

    //Requiere el módulo para comunicarse con la BD
    const mongoose = require('mongoose');

    //Almacena la dependencia para registrar errores remotamente
    const errorTracker = require('@sentry/node');

    //Método para manejar variables de entorno inadecuadas
    const handleInvalidEnv = (variable) => {

        //Almacena los posibles mensajes de error
        const variableErrors = {
            ip: "No database IP direction has been provided",
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

    //Comprueba que se hayan proporcionado todos los parámetros necesarios para la conexión
    if (!process.env.DB_IP || process.env.DB_IP.length === 0) return handleInvalidEnv('ip');
    if (!process.env.DB_PORT || process.env.DB_PORT.length === 0 || isNaN(process.env.DB_PORT)) return handleInvalidEnv('port');
    if (!process.env.DB_NAME || process.env.DB_NAME.length === 0) return handleInvalidEnv('name');
    if (!process.env.DB_AUTH_SOURCE || process.env.DB_AUTH_SOURCE.length === 0) return handleInvalidEnv('authSource');
    if (!process.env.DB_USERNAME || process.env.DB_USERNAME.length === 0) return handleInvalidEnv('username');
    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.length === 0) return handleInvalidEnv('password');

    //Indica el estado inicial de la carga en la consola
    logger.debug(`Starting connection to database: ${process.env.DB_AUTH_SOURCE}`);

    //Genera un objeto con las opciones necesarias para la conexión
    const options = {
        authSource: process.env.DB_AUTH_SOURCE, //La base de datos que contiene las credenciales del usuario 
        user: process.env.DB_USERNAME,          //El nombre de usuario de la base de datos
        pass: process.env.DB_PASSWORD,          //La contraseña de usuario de la base de datos
        useNewUrlParser: true,                  //Para usar el nuevo analizador de cadenas de conexión
        useUnifiedTopology: true,               //Habilitado porque el motor de supervisión y detección de servidores está en desuso
        autoIndex: false,                       //Mongoose no creará índices automáticamente para ningún modelo asociado con esta conexión
        connectTimeoutMS: 10000,                //Cuánto tiempo esperará el controlador MongoDB antes de eliminar un socket debido a inactividad
        family: 4                               //Para conectarse usando IPv4
    };

    //Genera la URI para la conexión con la BD
    const connectionString = `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    
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
            await require('../functions/db/migrate.js').run(options, 'up');
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

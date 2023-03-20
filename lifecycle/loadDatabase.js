
//Exporta una función para conectarse a la BD
exports.run = async (locale) => {

    //Indica el estado inicial de la carga en la consola
    console.log(`${locale.lifecycle.loadDatabase.connecting}: ${process.env.DB_AUTH_SOURCE}`)

    //Requiere el módulo para comunicarse con la BD
    const mongoose = require('mongoose');

    //Almacena la dependencia para registrar errores remotamente
    const errorTracker = require('@sentry/node');

    //Genera un objeto con las opciones necesarias para la conexión
    const options = {
        authSource: process.env.DB_AUTH_SOURCE, //La base de datos que contiene las credenciales del usuario 
        user: process.env.DB_USER,              //El nombre de usuario de la base de datos
        pass: process.env.DB_PASSWORD,          //La contraseña de usuario de la base de datos
        useNewUrlParser: true,                  //Para usar el nuevo analizador de cadenas de conexión
        useUnifiedTopology: true,               //Habilitado porque el motor de supervisión y detección de servidores está en desuso
        autoIndex: false,                       //Mongoose no creará índices automáticamente para ningún modelo asociado con esta conexión
        connectTimeoutMS: 10000,                //Cuánto tiempo esperará el controlador MongoDB antes de eliminar un socket debido a inactividad
        family: 4                               //Para conectarse usando IPv4
    };
    
    //Se conecta a la base de datos con las opciones proporcionadas
    mongoose.connect(process.env.DB_CONNECTION_STRING, options)
        .catch(error => {

            //Captura la excepción y la envía al manejador de errores remoto
            errorTracker.captureException(error);

            //Muestra un error por la consola
            console.error(`${new Date().toLocaleString()} 》${locale.lifecycle.loadDatabase.cantConnect}: \n ${error.stack}`)

            //Aborta el proceso de manera limpia
            process.exit();
        });

    //Hace que las promesas de Mongoose estén disponibles globalmente
    mongoose.Promise = global.Promise;

    //Cuando el bot se conecte a la base de datos
    mongoose.connection.on('connected', async () => {

        //Lo notifica en la consola
        console.log(`\n${locale.lifecycle.loadDatabase.onConnected}`)

        //Notifica la migración de los documentos en la consola
        console.log(`${locale.lifecycle.loadDatabase.checkIfMigrationNeeded} ...\n`)

        //Migra los documentos de la base de datos a la última versión
        await require('../functions/db/migrate.js').run(locale.functions.db.migrate, options, 'up');
    });
    
    //Cuando el bot sufre un error de conexión con la base de datos
    mongoose.connection.on('error', error => {

        //Captura la excepción y la envía al manejador de errores remoto
        errorTracker.captureException(error);

        //Muestra un error por la consola
        console.error(`${new Date().toLocaleString()} 》${locale.lifecycle.loadDatabase.onError}: \n ${error.stack}`)
    });

    //Alerta cuando el bot se desconecta de la base de datos
    mongoose.connection.on('disconnected', () => console.warn(`\n${new Date().toLocaleString()} 》${locale.lifecycle.loadDatabase.onDisconnected}\n`));

    //Alerta cuando falla el intento de reconexión a la base de datos
    mongoose.connection.on('reconnected', () => console.log(`\n${new Date().toLocaleString()} 》${locale.lifecycle.loadDatabase.onReconnected}\n`));
};

//Requiere el módulo para comunicarse con la BD
const mongoose = require('mongoose');

//Expora las funciones cómo un módulo
module.exports = {
    
    //Método para conectarse a la base de datos
    dbConnect: () => { 

        //Genera un objeto con las opciones necesarias para la conexión
        const options = {
            authSource: process.env.DB_AUTH_SOURCE,
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
            useNewUrlParser: true, //Para usar el nuevo analizador de cadenas de conexión (el antiguo está en desuso) [mongoose.connect]
            useUnifiedTopology: true, //Habilitado porque el motor de supervisión y detección de servidores está en desuso
            autoIndex: false, //Mongoose no creará índices automáticamente para ningún modelo asociado con esta conexión
            connectTimeoutMS: 10000, //Cuánto tiempo esperará el controlador MongoDB antes de eliminar un socket debido a inactividad
            family: 4 //Para conectarse usando IPv4
        };
        
        //Conectarse a la base de datos
        mongoose.connect(process.env.DB_CONNECTION_STRING, options);

        //Hace que las promesas de Mongoose estén disponibles globalmente
        mongoose.Promise = global.Promise;

        //Alerta cuando el bot está conectado a la base de datos
        mongoose.connection.on('connected', () => console.log(`Mongoose connection to ${process.env.DB_AUTH_SOURCE} successfully opened!\n`));
        
        //Alerta cuando el bot sufre un error de conexión con la base de datos
        mongoose.connection.on('error', error => console.error(`Mongoose connection error: \n ${error.stack}`));

        //Alerta cuando el bot se desconecta de la base de datos
        mongoose.connection.on('disconnected', () => console.log('Mongoose connection aborted'));

        //Alerta cuando falla el intento de reconexión a la base de datos
        mongoose.connection.on('reconnectFailed', () => console.log('Mongoose reconnection try failed'));
    }
};

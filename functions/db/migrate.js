//Función para migrar documentos de la BD
exports.run = async (locale, dbOptions, direction, targetMigration) => {

    try {

        //Comprueba si se ha proporcionado una dirección válida
        if (!['up', 'down'].includes(direction)) return false;
    
        //Requiere el módulo para comunicarse con la BD
        const mongoose = require('mongoose');
    
        //Carga la dependencia para migrar documentos de MongoDB
        const migrate = require('migrate-mongo');
    
        //Carga la configuración para las migraciones
        migrate.config.set({
            mongodb: {
                url: process.env.DB_CONNECTION_STRING,
                options: dbOptions
            },
            migrationsDir: 'migrations',
            changelogCollectionName: 'changelog',
            migrationFileExtension: '.js'
        });

        //Comprueba el estado de las migraciones
        const migrationStatus = await migrate.status(mongoose.connection.db);

        //Almacena las migraciones pendientes
        const pendingMigrations = migrationStatus.filter((file) => file.appliedAt === 'PENDING');
    
        //Si no hay migraciones ascendentes pendientes
        if (direction === 'up' && pendingMigrations.length === 0) {

            //Indica en consola que no hay migraciones pendientes
            return console.log(`${locale.noPendingMigrations}\n`);

        } else {

            //Indica en consola que hay migraciones pendientes
            console.log(`${locale.pendingMigrations}: ${pendingMigrations.length}`);

            //Por cada una de las migraciones pendientes
            pendingMigrations.forEach((migration) => {

                //Muestra el nombre de la migración por consola
                console.log(`- ${migration.fileName.replace('.js', '')}`);
            });

            //Añade un salto de línea a la consola
            console.log('\n');
        };
    
        //Realiza todas las migraciones correspondientes, en función de la dirección proporcionada, y hasta una versión en específico
        await migrate[direction](mongoose.connection.db, targetMigration ? `${targetMigration}.js` : null);

        //Indica por consola que las migraciones se han completado
        console.log(`\n${locale.migrationsDone}\n`);

    } catch (error) {

        //Almacena la dependencia para registrar errores remotamente
        const errorTracker = require('@sentry/node');

        //Captura la excepción y la envía al manejador de errores remoto
        errorTracker.captureException(error);

        //Notifica el error por consola
        console.error(`${new Date().toLocaleString()} 》${locale.migrationsUncomplete}: ${error.stack}\n`)
    };
};
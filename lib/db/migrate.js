// Function to migrate database documents
export default async (dbOptions, direction, targetMigration) => {

    try {

        // Checks if a valid address has been provided
        if (!['up', 'down'].includes(direction)) return false;
    
        // Requires the module to communicate with the database
        const mongoose = require('mongoose');
    
        // Loads the dependency to migrate MongoDB documents
        const migrate = require('migrate-mongo');
    
        // Loads the configuration for migrations
        migrate.config.set({
            mongodb: {
                url : `mongodb://${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
                options: dbOptions
            },
            migrationsDir: 'migrations',
            changelogCollectionName: 'changelog',
            migrationFileExtension: '.js'
        });

        // Checks the status of the migrations
        const migrationStatus = await migrate.status(mongoose.connection.db);

        // Stores the pending migrations
        const pendingMigrations = migrationStatus.filter((file) => file.appliedAt === 'PENDING');
    
        // If there are no pending ascending migrations
        if (direction === 'up' && pendingMigrations.length === 0) {

            // Indicates in console that there are no pending migrations
            return logger.debug('There are no pending migrations');

        } else {

            // Indicates in console that there are pending migrations
            logger.debug(`Migrations to be performed: ${pendingMigrations.length}`);

            // For each of the pending migrations
            pendingMigrations.forEach((migration) => {

                // Shows the name of the migration by console
                logger.debug(`- ${migration.fileName.replace('.js', '')}`);
            });
        };
    
        // Perform all the corresponding migrations, depending on the provided address, and to a specific version
        await migrate[direction](mongoose.connection.db, targetMigration ? `${targetMigration}.js` : null);

        // Indicates by console that migrations have been completed
        logger.debug('All documents in the database have been migrated!')

    } catch (error) {

        // Stores the dependency to record errors remotely
        const errorTracker = require('@sentry/node');

        // Captures the exception and sends it to the remote error handler
        errorTracker.captureException(error);

        // Notifies the error on the console
        logger.error(`An error occurred during the migration of the database documents: ${error.stack}`)
    };
};

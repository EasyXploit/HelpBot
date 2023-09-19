
// Exports a function to connect to the database
export async function loadDatabase(localConfig) {

    // Requires the module to communicate with the database
    const mongoose = require('mongoose');

    // Stores the dependency to record errors remotely
    const errorTracker = require('@sentry/node');

    // Method to handle inadequate environment variables
    const handleInvalidEnv = (variable) => {

        // Stores the possible error messages
        const variableErrors = {
            target: "No database target direction has been provided",
            port: "No database port has been provided, or it is not a number",
            name: "No database name has been provided",
            authSource: "No database provided for authorization",
            username: "A username has not been provided for the database connection",
            password: "A password has not been provided for the connection to the database"
        };

        // Notifies the error through the console depending on the type
        logger.error(`${variableErrors[variable]}. The program will stop`);

        // Aborts the process in a clean way
        process.exit(1);
    };

    // Stores the necessary parameters for the connection
    const target = process.env.DB_TARGET && process.env.DB_TARGET.length > 0 ? process.env.DB_TARGET : localConfig.database.target;
    const port = process.env.DB_PORT && process.env.DB_PORT.length > 0 ? process.env.DB_PORT : localConfig.database.port;
    const name = process.env.DB_NAME && process.env.DB_NAME.length > 0 ? process.env.DB_NAME : localConfig.database.name;
    const authSource = process.env.DB_AUTH_SOURCE && process.env.DB_AUTH_SOURCE.length > 0 ? process.env.DB_AUTH_SOURCE : localConfig.database.authSource;
    const username = process.env.DB_USERNAME && process.env.DB_USERNAME.length > 0 ? process.env.DB_USERNAME : localConfig.database.username;
    const password = process.env.DB_PASSWORD && process.env.DB_PASSWORD.length > 0 ? process.env.DB_PASSWORD : localConfig.database.password;

    // Checks that all the necessary parameters for the connection have been provided
    if (!target) return handleInvalidEnv('target');
    if (!port || isNaN(port)) return handleInvalidEnv('port');
    if (!name) return handleInvalidEnv('name');
    if (!authSource) return handleInvalidEnv('authSource');
    if (!username) return handleInvalidEnv('username');
    if (!password) return handleInvalidEnv('password');

    // Indicates the initial state of the load on the console
    logger.debug(`Starting connection to database: ${authSource}`);

    // Generates an object with the necessary options for the connection
    const options = {
        authSource: authSource,     // The database containing user credentials
        user: username,             // The database username
        pass: password,             // The database user password
        useNewUrlParser: true,      // To use the new connection string analyzer
        useUnifiedTopology: true,   // Enabled because the server supervision and detection engine is in disuse
        autoIndex: false,           // Mongoose will not create indexes automatically for any model associated with this connection
        connectTimeoutMS: 10000,    // How long will the MongoDB controller wait before eliminating a socket due to inactivity
        family: 4                   // To connect using IPV4
    };

    // Generates the URI for the connection with the database
    const connectionString = `mongodb://${target}:${port}/${name}`;
    
    // Connects to the database with the options provided
    mongoose.connect(connectionString, options)
        .catch(error => {

            // Captures the exception and sends it to the remote error handler
            errorTracker.captureException(error);

            // Shows an error through the console
            logger.error(`Could not connect to the database, so the program will stop: ${error.stack}`)

            // Aborts the process in a clean way
            process.exit(1);
        });

    // Makes Mongoose's promises available globally
    mongoose.Promise = global.Promise;

    // When the bot connects to the database
    mongoose.connection.on('connected', async () => {

        // Notifies it on the console
        logger.debug('Connection to the database successfully opened');

        // If the program version is a production one
        if (process.env.NODE_ENV === 'production') {

            // Notifies the migration of the documents in the console
            logger.debug('Checking that all DB documents have the correct version');
    
            // Migrates the database documents to the latest version
            await client.functions.db.migrate(options, 'up');
        };
    });
    
    // When the bot suffers a connection error with the database
    mongoose.connection.on('error', error => {

        // Captures the exception and sends it to the remote error handler
        errorTracker.captureException(error);

        // Shows an error through the console
        logger.error(`Connection to the database error: ${error.stack}`);
    });

    // Alerts when the bot is disconnected from the database
    mongoose.connection.on('disconnected', () => logger.warn('Connection to the database aborted. Reconnection will be attempted'));

    // Alerts when the reconnection attempt to the database fails
    mongoose.connection.on('reconnected', () => logger.debug('Connection to the database restablished'));
};

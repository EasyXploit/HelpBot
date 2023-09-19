// Exports a function to load all global functions in the client
export async function loadFunctions() {

    try {

        // Creates an object in the client for the functions
        client.functions = {};

        // For each of the types of global function
        for (const functionType of fs.readdirSync('./lib/')) {

            // Omits the loaders directory
            if (functionType === 'loaders') continue;

            // Creates the object in the client for the category
            client.functions[functionType] = {};

            // For each function of said category
            for (const functionFile of fs.readdirSync(`./lib/${functionType}/`)) {

                // Stores the route to the file
                const path = `../${functionType}/${functionFile}`;

                // Imports the function asynchronously
                const importedFunction = await import(path);

                // Loads the execution function of each file
                client.functions[functionType][functionFile.split('.').shift()] = importedFunction.default;
            };
        };

        // Shows the result of the functions load
        logger.debug('Global functions loading completed');

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

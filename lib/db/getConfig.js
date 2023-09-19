// Function to obtain a database configuration document
export default async (configPath) => {

    try {

        // Separates the route by keys in an array
        configPath = configPath.split('.');

        // Stores the name of the document
        const configName = configPath[0];

        // Imports the corresponding script to the required model
        const ConfigModel = await import(`../../models/config/${configName}.js`);
    
        // Looks for the configuration document by it's model and name
        let configDoc = await ConfigModel.default.findOne({ docType: configName }).exec();
    
        // If could not find the document
        if (!configDoc) {

            // Imports the documents generator
            const configGenerator = await import('./genConfig.js');

            // Generates a new document
            configDoc = configGenerator.default(configName);
        };

        // Stores the current iterated key
        let returnValue = configDoc;

        // Deletes the name of the route to the document
        configPath.shift();

        // For each of the keys of the route
        for (const key of configPath) {

            // If it is a non-null and existing object
            if (typeof returnValue === 'object' && returnValue !== null && key in returnValue) {

                // Stores the value of the iterated key
                returnValue = returnValue[key];

            } else {

                // Returns null
                return null;
            };
        };

        // Returns the value found
        return returnValue;

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};



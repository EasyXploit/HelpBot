// Function to obtain a database configuration document
export default async (configPath, newValue) => {

    try {

        // Separates the route by keys in an array
        configPath = configPath.split('.');

        // Stores the name of the document
        const configName = configPath[0];

        // Imports the corresponding script to the required model
        const ConfigModel = await import(`../../models/config/${configName}.js`);
    
        // Looks for the configuration document by it's model and name
        let configDoc = await ConfigModel.default.findOne({ docType: configName }).exec();

        // If the document could not be found
        if (!configDoc) {

            // Imports the documents generator
            const configGenerator = await import('./genConfig.js');

            // Generates a new document
            configDoc = configGenerator.default(configName);
        };

        // Deletes the name of the document from the route
        configPath.shift();

        // Stores the iterated step
        let step = configDoc;

        // For each of the keys of the route
        for (const key of configPath) {

            // If it is a non-null and existing object
            if (typeof step === 'object' && step !== null && key in step) {

                // Stores the value of the iterated key
                step = step[key];

            } else {

                // Returns null if the target key does not exist
                return null;
            };
        };

        // Changes the value of the key provided
        await configDoc.set(configPath.join('.'), newValue);

        // Saves the document with the changes
        await configDoc.save();

        // Returns the new value
        return newValue;

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};



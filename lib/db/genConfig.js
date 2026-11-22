// Stores the generations in progress, so the same document is not generated twice when it is requested several times at once
const pendingGenerations = {};

// Function to generate a configuration document in the database (or to obtain it, if it already exists)
export default async (configName) => {

    // If the document is already being generated, waits for that generation
    if (pendingGenerations[configName]) return pendingGenerations[configName];

    // Stores the generation of the document
    pendingGenerations[configName] = (async () => {

        try {

            // Imports the corresponding script to the required model
            const ConfigModel = await import(`../../models/config/${configName}.js`);

            // Looks for the document, in case it was generated while waiting
            const existingConfigDoc = await ConfigModel.default.findOne({ docType: configName }).exec();

            // Returns the existing document, if found
            if (existingConfigDoc) return existingConfigDoc;
        
            // Generates a new configuration document
            const newConfigDoc = new ConfigModel.default();
        
            // Returns the saved document
            return await newConfigDoc.save();

        } catch (error) {

            // Sends an error message to the console
            logger.error(error.stack);

        } finally {

            // Deletes the generation from the generations in progress
            delete pendingGenerations[configName];
        };
    })();

    // Returns the generated document
    return pendingGenerations[configName];
};

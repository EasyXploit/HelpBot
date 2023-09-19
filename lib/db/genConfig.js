// Function to generate or regenerate a configuration document in the database
export default async (configName) => {

    try {

        // Imports the corresponding script to the required model
        const ConfigModel = await import(`../../models/config/${configName}.js`);
    
        // Generates a new configuration document
        const newConfigDoc = new ConfigModel.default();
    
        // Returns the saved document
        return newConfigDoc.save();

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

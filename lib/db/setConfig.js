// Imports the necessary libraries
import loadConfig, { writeConfig } from './loadConfig.js';

// Function to change a value of the configuration, in memory and in the database
export default async (configPath, newValue) => {

    try {

        // Separates the route by keys in an array
        const keys = configPath.split('.');

        // Stores the name of the document, removing it from the route
        const configName = keys.shift();

        // Loads the document in memory (if it was not loaded yet), and returns null if it could not be loaded
        if (!await loadConfig(configName)) return null;

        // Changes the value and saves the document (returns null if the key does not exist in the document)
        return await writeConfig(configName, keys, newValue);

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

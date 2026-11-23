// Imports the necessary libraries
import lodash from 'lodash';
import loadConfig from './loadConfig.js';

// Function to obtain a value of the configuration (or a whole document), from memory
export default async (configPath) => {

    try {

        // Separates the route by keys in an array
        const keys = configPath.split('.');

        // Stores the document from memory (loading it the first time), removing its name from the route
        const entry = await loadConfig(keys.shift());

        // Returns null if the document could not be loaded
        if (!entry) return null;

        // Stores the current iterated value
        let returnValue = entry.plain;

        // For each of the keys of the route
        for (const key of keys) {

            // If it is a non-null and existing object, stores the value of the iterated key, or returns null otherwise
            if (typeof returnValue === 'object' && returnValue !== null && key in returnValue) returnValue = returnValue[key];
            else return null;
        };

        // Returns a copy of the value found (so changing it does not change the configuration in memory)
        return typeof returnValue === 'object' && returnValue !== null ? lodash.cloneDeep(returnValue) : returnValue;

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};

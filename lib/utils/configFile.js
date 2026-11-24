// Imports the necessary libraries
import fs from 'fs';
import path from 'path';

// Function to obtain the path of the local configuration file: the one of the CONFIG_FILE environment variable (that is created as a copy of the default one if it does not exist yet), or config.json otherwise
export default () => {

    // Stores the path of the default local configuration file
    const defaultFile = path.resolve('config.json');

    // Returns the default file, if no other one was provided
    if (!process.env.CONFIG_FILE || process.env.CONFIG_FILE.length === 0) return defaultFile;

    // Stores the path of the provided file
    const configFile = path.resolve(process.env.CONFIG_FILE);

    // If the provided file does not exist yet, creates it as a copy of the default one
    if (!fs.existsSync(configFile)) {
        fs.mkdirSync(path.dirname(configFile), { recursive: true });
        fs.copyFileSync(defaultFile, configFile);
    };

    // Returns the provided file
    return configFile;
};

// Fills the empty database settings of the local configuration with the MongoDB service of the Docker Compose project, and a random password, so they do not have to be set by hand
// It is run by docker-entrypoint.sh before starting the bot (only in Docker Compose), and it does not fill the settings that are set in the environment variables, as they take precedence
import fs from 'fs';
import crypto from 'crypto';
import configFile from './lib/utils/configFile.js';

// Stores the path of the local configuration file (in Docker, config.json is a link to data/config.json), and reads it
const configPath = configFile();
const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
if (!localConfig.database) localConfig.database = {};

// Stores the database settings, with the environment variable that sets each one and its default value (the password is generated)
const settings = {
    target: { variable: 'DB_TARGET', value: 'mongodb' },
    port: { variable: 'DB_PORT', value: 27017 },
    authSource: { variable: 'DB_AUTH_SOURCE', value: 'admin' },
    name: { variable: 'DB_NAME', value: 'helpbot' },
    username: { variable: 'DB_USERNAME', value: 'helpbot' },
    password: { variable: 'DB_PASSWORD', value: null }
};

// Stores whether any setting was filled
let filled = false;

// For each of the settings
for (const [key, { variable, value }] of Object.entries(settings)) {

    // Omits it if it is set in its environment variable, or in the local configuration
    if (process.env[variable] && process.env[variable].length > 0) continue;
    if (localConfig.database[key] !== undefined && localConfig.database[key] !== null && String(localConfig.database[key]).length > 0) continue;

    // Fills it with its default value, or with a random password
    localConfig.database[key] = value !== null ? value : crypto.randomBytes(24).toString('base64url');
    filled = true;
};

// If any setting was filled, saves the local configuration
if (filled) {
    fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 4));
    console.log(`Filled the empty database settings of ${configPath}`);
};

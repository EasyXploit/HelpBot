// Imports libraries
import { promisify } from 'util';
import fs from 'fs';

// Converts fs.readdir into a function that returns promises
const readdir = promisify(fs.readdir);

// Exports the main function
export async function loadEvents() {

    try {

        // Reads the directory of events
        const files = await readdir('./handlers/events/');

        // For each of the event files
        for (const file of files) {

            // Imports the function and extracts it's name
            const eventFunction = await import(`../../handlers/events/${file}`);
            const eventName = file.split('.')[0];

            // Adds a listener for the event in question (using spread syntax)
            client.on(eventName, async (...args) => await eventFunction.default(...args, client.locale.handlers.events[eventName]));

            // Notifies the load in the console
            logger.debug(`Event [${eventName}] loaded successfully`);
        };

    } catch (error) {

        // If an error is generated, aborts the load of the rest of the events
        logger.error(`Failed to complete events loading: ${error.stack}`);
    };
};

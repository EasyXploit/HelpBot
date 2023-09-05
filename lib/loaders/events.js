//Importa librerías
import { promisify } from 'util';
import fs from 'fs';

//Convierte fs.readdir en una función que devuelve promesas
const readdir = promisify(fs.readdir);

//Exporta la función principal
export async function loadEvents() {

    try {

        //Lee el directorio de los manejadores de eventos
        const files = await readdir('./handlers/events/');

        //Por cada uno de los ficheros de eventos
        for (const file of files) {

            //Importa la función y extrae su nombre
            const eventFunction = await import(`../../handlers/events/${file}`);
            const eventName = file.split('.')[0];

            //Añade un listener para el evento en cuestión (usando spread syntax)
            client.on(eventName, async (...args) => await eventFunction.default(...args, client.locale.handlers.events[eventName]));

            //Notifica la carga en la consola
            logger.debug(`Event [${eventName}] loaded successfully`);
        };

    } catch (error) {

        //Si se genera un error, aborta la carga del resto de eventos
        logger.error(`Failed to complete events loading: ${error.stack}`);
    };
};

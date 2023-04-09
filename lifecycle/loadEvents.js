exports.run = async () => {

    //Lee el directorio de los manejadores de eventos
    await client.fs.readdir('./handlers/events/', async (error, files) => {

        //Si se genera un error, aborta la carga del resto de eventos
        if (error) return logger.error(`Failed to complete events loading: ${error.stack}`);
        
        //Precarga cada uno de los eventos
        await files.forEach(file => {

            const eventFunction = require(`../handlers/events/${file}`);    //Almacena la función del evento
            const eventName = file.split('.')[0];                           //Almacena el nombre del evento

            //Añade un listener para el evento en cuestión (usando spread syntax)
            client.on(eventName, (...arguments) => eventFunction.run(...arguments, client.locale.handlers.events[eventName]));

            //Notifica la carga en la consola
            logger.debug(`Event [${eventName}] loaded successfully`);
        });
    });
};

//Función para obtener un documento de configuración de la base de datos
export default async (configPath, newValue) => {

    try {

        //Separa la ruta por claves en un array
        configPath = configPath.split('.');

        //Almacena el nombre del documento
        const configName = configPath[0];

        //Importa el script correspondiente al modelo requerido
        const ConfigModel = await import(`../../models/config/${configName}.js`);
    
        //Busca el documento de configuración por su modelo y nombre
        let configDoc = await ConfigModel.default.findOne({ docType: configName }).exec();

        //Si no encuentra el documento
        if (!configDoc) {

            //Importa el generador de documentos
            const configGenerator = await import('./genConfig.js');

            //Genera un nuevo documento
            configDoc = configGenerator.default(configName);
        };

        //Elimina el nombre del documento de la ruta
        configPath.shift();

        //Almacena el paso iterado
        let step = configDoc;

        //Por cada una de las claves de la ruta
        for (const key of configPath) {

            //Si es un objeto no-nulo y existente
            if (typeof step === 'object' && step !== null && key in step) {

                //Almacena el valor de la clave iterada
                step = step[key];

            } else {

                //Devuelve nulo si la clave objetivo no existe
                return null;
            };
        };

        //Cambia el valor de la clave proporcionada
        await configDoc.set(configPath.join('.'), newValue);

        //Guarda el documento con los cambios
        await configDoc.save();

        //Devuelve el nuevo valor
        return newValue;

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};



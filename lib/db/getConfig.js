//Función para obtener un documento de configuración de la base de datos
export default async (configPath) => {

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
            const configGenerator = await import('./db/genConfig.js');

            //Genera un nuevo documento
            configDoc = configGenerator.default(configName);
        };

        //Almacena la clave iterada actualmente
        let returnValue = configDoc;

        //Elimina el nombre del documento de la ruta
        configPath.shift();

        //Por cada una de las claves de la ruta
        for (const key of configPath) {

            //Si es un objeto no-nulo y existente
            if (typeof returnValue === 'object' && returnValue !== null && key in returnValue) {

                //Almacena el valor de la clave iterada
                returnValue = returnValue[key];

            } else {

                //Devuelve nulo
                return null;
            };
        };

        //Devuelve el valor encontrado
        return returnValue;

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};



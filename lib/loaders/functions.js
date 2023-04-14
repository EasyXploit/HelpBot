//Exporta una función para cargar todas las funciones globales en el cliente
export async function loadFunctions() {

    try {

        //Por cada uno de los tipos de función global
        for (const functionType of fs.readdirSync('./lib/')) {

            //Omite el directorio de cargadores
            if (functionType === 'loaders') continue;

            //Crea el objeto en el cliente para la categoría
            client.functions[functionType] = {};

            //Por cada función de dicha categoría
            for (const functionFile of fs.readdirSync(`./lib/${functionType}/`)) {

                //Almacena la ruta al fichero
                const path = `../${functionType}/${functionFile}`;

                //Importa la función de manera asíncrona
                const importedFunction = await import(path);

                //Carga la función de ejecución de cada archivo
                client.functions[functionType][functionFile.split('.').shift()] = importedFunction.default;
            };
        };

        //Muestra el resultado de la carga de funciones
        logger.debug('Global functions loading completed');

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

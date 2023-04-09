exports.run = async () => {

    try {

        //Por cada uno de los tipos de función global
        for (const functionType of client.fs.readdirSync('./functions/')) {

            //Crea el objeto en el cliente para la categoría
            client.functions[functionType] = {};

            //Por cada función de dicha categoría
            for (const functionFile of client.fs.readdirSync(`./functions/${functionType}/`)) {

                //Almacena la extensión del archivo
                const fileExtension = functionFile.split('.').pop();

                //Almacena la ruta al fichero
                const path = `../functions/${functionType}/${functionFile}`;

                //Carga la función de ejecución de cada archivo, en función del cargador de módulos a emplear (CommonJS o ESM)
                client.functions[functionType][functionFile.split('.').shift()] = fileExtension === 'mjs' ? import(path) : require(path);
            };
        };

        //Muestra el resultado de la carga de funciones
        logger.debug('Global functions loading completed');

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

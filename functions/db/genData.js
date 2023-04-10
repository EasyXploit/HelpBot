//Función para generar un documento de datos en la base de datos
module.exports = async (dataType, data) => {

    try {

        //Importa el script correspondiente al modelo requerido
        const DataModel = require(`../../models/data/${dataType}.js`);

        //Genera un nuevo documento para este dato
        let newDataDoc = new DataModel();

        //Por cada uno de los datos de inicialización
        for (const key in data) {

            //Comprueba si lo puede añadir al documento
            if (Object.hasOwnProperty.call(data, key)) {

                //Lo añade al documento
                newDataDoc.set(key, data[key]);
            };
        };
    
        //Devuelve el documento ya guardado
        return newDataDoc.save();

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

//Función para eliminar un documento de datos de la base de datos, o todos
module.exports = async (dataType, dataId) => {

    try {

        //Si no se proporcionó ningún tipo de dato, aborta
        if (!dataType) return false;

        //Importa el script correspondiente al modelo requerido
        const DataModel = require(`../../models/data/${dataType}.js`);

        //Si se proporcionó un ID para la búsqueda
        if (dataId) {

            //Crea una variable para almacenar la propiedad a buscar
            let idType;
            
            //Selecciona la propiedad a buscar en función del modelo
            switch (dataType) {
                case 'ban':
                case 'profile':
                case 'timeout':
                    idType = 'userId';
                    break;   
                case 'poll':
                    idType = 'pollId';
                    break;
                case 'sent':
                    idType = 'hash';
                    break;
            };

            //Busca el dato en función del ID proporcionado, y elimina el documento
            const data = await DataModel.deleteOne({ [idType]: dataId });
            
            //Devuelve el número de documentos borrados, o falso si ninguno
            if (data.deletedCount > 0) return data.deletedCount;
            else return false;

        } else {

            //Elimina todos los documentos de la colección
            const data = await DataModel.deleteMany({});

            //Devuelve el número de documentos borrados, o falso si ninguno
            if (data.deletedCount > 0) return data.deletedCount;
            else return false;
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

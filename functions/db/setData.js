//Función para modificar un documento de datos de la base de datos, o todos
module.exports = async (dataType, dataId, newData, filters) => {

    try {

        //Si no se proporcionó ningún tipo de dato, aborta
        if (!dataType || !newData || typeof newData !== 'object') return false;

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
                    idType = 'messageHash';
                    break;
            };

            //Busca el dato en función del ID proporcionado, y elimina el documento
            const data = await DataModel.updateOne({ [idType]: dataId }, newData);
            
            //Devuelve el número de documentos modificados, o falso si ninguno
            if (data.modifiedCount > 0) return data.modifiedCount;
            else return false;

        } else {

            //Actualiza todos los documentos de la colección, o lo que encajen con los filtros
            const data = await DataModel.updateMany(filters || {}, newData);

            //Devuelve el número de documentos modificados, o falso si ninguno
            if (data.modifiedCount > 0) return data.modifiedCount;
            else return false;
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

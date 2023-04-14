//Función para obtener un documento de datos de la base de datos, o todos
export default async (dataType, dataId) => {

    try {

        //Si no se proporcionó ningún tipo de dato, aborta
        if (!dataType) return false;

        //Importa el script correspondiente al modelo requerido
        const DataModel = await import(`../../models/data/${dataType}.js`);

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

            //Busca el dato en función del ID proporcionado
            const data = await DataModel.default.findOne({ [idType]: dataId });
            
            //Devuelve el dato, o nada si no lo encontró
            if (data) return data;
            else return false;

        } else {

            //Busca todos los datos de la colección
            const data = await DataModel.default.find();

            //Devuelve un array con toda la colección, o nada si no encontró nada
            if (data) return data;
            else return false;
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

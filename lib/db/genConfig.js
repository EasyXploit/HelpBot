//Función para generar o regenerar un documento de configuración en la base de datos
export default async (configName) => {

    try {

        //Importa el script correspondiente al modelo requerido
        const ConfigModel = await import(`../../models/config/${configName}.js`);
    
        //Genera un nuevo documento de la configuración 
        const newConfigDoc = new ConfigModel.default();
    
        //Devuelve el documento guardado
        return newConfigDoc.save();

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

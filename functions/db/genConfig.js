//Función para generar o regenerar un documento de configuración en la base de datos
exports.run = async (configName) => {

    try {

        //Importa el script correspondiente al modelo requerido
        const ConfigModel = require(`../../models/config/${configName}.js`);
    
        //Genera un nuevo documento de la configuración 
        const newConfigDoc = new ConfigModel();
    
        //Devuelve el documento guardado
        return newConfigDoc.save();

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》`, error.stack);
    };
};

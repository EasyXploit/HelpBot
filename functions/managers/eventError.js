//Función para gestionar los errores en los eventos
exports.run = async (client, error, eventName) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.eventError;

    //Se muestra el error en consola
    console.error(`\n${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    
    //Almacena el string del error, y lo recorta si es necesario
    const errorString = error.stack.length > 1014 ? `${error.stack.slice(0, 1014)} ...` : error.stack;
};
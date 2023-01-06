//Función para gestionar los errores en los eventos
exports.run = async (client, error) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.eventError;

    //Se muestra el error en consola
    console.error(`\n${new Date().toLocaleString()} 》${locale.error}:`, error.stack);

    //Envía la excepción al manejador de errores remoto
    client.errorTracker.captureException(error);
};
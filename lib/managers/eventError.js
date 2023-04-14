//Función para gestionar los errores en los eventos
export default async (error) => {

    //Se muestra el error en consola
    logger.error(error.stack);

    //Envía la excepción al manejador de errores remoto
    client.errorTracker.captureException(error);
};
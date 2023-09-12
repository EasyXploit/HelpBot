//Exporta la función de manejo del evento
export default (error, locale) => {

    //Muestra un aviso en la consola si se trata de un error de conexión cerrada
    if (error.message.includes('ECONNRESET')) return logger.error('The connection to Discord was closed unexpectedly');

    //Muestra un aviso en la consola
    logger.error(error.stack);
};

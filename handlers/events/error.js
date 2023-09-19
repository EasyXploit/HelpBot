// Exports the event management function
export default (error, locale) => {

    // Shows a notice in the console if it is a closed connection error
    if (error.message.includes('ECONNRESET')) return logger.error('The connection to Discord was closed unexpectedly');

    // Shows a notice in the console
    logger.error(error.stack);
};

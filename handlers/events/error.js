export default (error, locale) => {
    if (error.message.includes('ECONNRESET')) return logger.error('The connection to Discord was closed unexpectedly');
    logger.error(error.stack);
};

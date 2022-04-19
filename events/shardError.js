exports.run = (error, client, locale) => {
    console.error(`${new Date().toLocaleString()} 》${locale.errorMessage}:`, error.stack);
};

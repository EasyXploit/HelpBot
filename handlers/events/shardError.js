exports.run = (error, client, locale) => {
    console.error(`${new Date().toLocaleString()} 》 `, error.stack);
};

exports.run = (error,locale) => {
    console.error(`${new Date().toLocaleString()} 》 `, error.stack);
};

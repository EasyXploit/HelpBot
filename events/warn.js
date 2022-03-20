exports.run = (warn) => {
    console.warn(`${new Date().toLocaleString()} 》AVISO: ${warn.stack}`);
};

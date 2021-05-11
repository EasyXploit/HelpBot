exports.run = (warn) => {
    console.warn(`${new Date().toLocaleString()} 》ADVERTENCIA: ${warn.stack}`);
};

exports.run = (warn,locale) => {
    console.warn(`${new Date().toLocaleString()} 》${locale.warnMessage}:`, warn);
};

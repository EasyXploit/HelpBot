exports.run = (warn, client, locale) => {
    console.warn(`${new Date().toLocaleString()} 》${locale.warnMessage}:`, warn);
};

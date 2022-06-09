exports.run = (error, client, locale) => {
    if (error.message.includes('ECONNRESET')) return console.error(`${new Date().toLocaleString()} 》${locale.econnresetError}.\n`);
    console.error(`${new Date().toLocaleString()} 》${locale.otherError}:`, error.stack);
};

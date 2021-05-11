exports.run = (error) => {
    if (error.message.includes('ECONNRESET')) return console.log(`${new Date().toLocaleString()} ERROR 》La conexión fue cerrada inesperadamente.\n`);
    console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
};

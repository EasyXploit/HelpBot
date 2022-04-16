exports.run = (error, client, locale) => {
    console.error(`${new Date().toLocaleString()} 》ERROR: Una conexión al websocket encontró un error:`, error.stack);
};

exports.run = (error) => {
    console.error(`${new Date().toLocaleString()} 》ERROR: Una conexión al websocket encontró un error:`, error.stack);
};

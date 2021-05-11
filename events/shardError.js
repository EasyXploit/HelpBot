exports.run = (error) => {
    console.error(`${new Date().toLocaleString()} 》Una conexión al websocket encontró un error:\n${error.stack}`);
};

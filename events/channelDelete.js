exports.run = async (channel, client) => {
    if (channel.type === 'text') {
        if (channel.id === client.config.main.debuggingChannel) {

            //Borra la configuración y descarga el canal
            client.config.main.debuggingChannel = '';
            client.debuggingChannel = null;

            //Graba la nueva configuración en el almacenamiento
            await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), (err) => console.error(err));

            //Advertir por consola
            console.error(`${new Date().toLocaleString()} 》Error: El canal de depuración ya no existe o no se puede tener acceso.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);
        };

        if (channel.id === client.config.main.loggingChannel) {

            //Borra la configuración y descarga el canal
            client.config.main.loggingChannel = '';
            client.loggingChannel = null;

            //Graba la nueva configuración en el almacenamiento
            await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), (err) => console.error(err));

            //Advertir por consola
            console.error(`${new Date().toLocaleString()} 》Error: El canal de auditoría ya no existe o no se puede tener acceso.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);
        };
    };
};

exports.run = async (channel, client, locale) => {

    try {

        //Solo si el canal era de texto
        if (channel.type === 'GUILD_TEXT') {

            //Solo si el canal era el de depuración
            if (channel.id === client.config.main.debuggingChannel) {

                //Borra la configuración y descarga el canal
                client.config.main.debuggingChannel = '';
                client.debuggingChannel = null;

                //Advertir por consola
                console.error(`${new Date().toLocaleString()} 》ERROR: El canal de depuración ya no existe o no se puede tener acceso.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);

                //Graba la nueva configuración en el almacenamiento
                await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
            };

            //Solo si el canal era el de registro
            if (channel.id === client.config.main.loggingChannel) {

                //Borra la configuración y descarga el canal
                client.config.main.loggingChannel = '';
                client.loggingChannel = null;

                //Advertir por consola
                console.error(`${new Date().toLocaleString()} 》ERROR: El canal de registro ya no existe o no se puede tener acceso.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);

                //Graba la nueva configuración en el almacenamiento
                await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
            };
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.eventErrorHandler(error, 'channelDelete');
    };
};

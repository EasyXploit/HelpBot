exports.run = async (channel, client) => {
    if (channel.type === 'text') {
        if (channel.id === client.config.guild.debuggingChannel) {

            //Borra la configuración y descarga el canal
            client.config.guild.debuggingChannel = '';
            client.debuggingChannel = null;

            //Graba la nueva configuración en el almacenamiento
            await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error(err));

            //Advertir por consola
            console.error(`${new Date().toLocaleString()} 》Error: El canal de depuración ya no existe o no se puede tener acceso.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);
        };

        if (channel.id === client.config.guild.loggingChannel) {

            //Borra la configuración y descarga el canal
            client.config.guild.loggingChannel = '';
            client.loggingChannel = null;

            //Graba la nueva configuración en el almacenamiento
            await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error(err));

            //Advertir por consola
            console.error(`${new Date().toLocaleString()} 》Error: El canal de auditoría ya no existe o no se puede tener acceso.\n Se ha borrado de la configuración y se ha descargado de la memoria.`);
        };
    };
};

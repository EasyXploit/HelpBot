exports.run = async (channel, client, locale) => {

    try {

        //Solo si el canal era de texto
        if (channel.type === 'GUILD_TEXT') {

            //Aborta si no es un evento de la guild registrada
            if (channel.guild.id !== client.homeGuild.id) return;

            //Solo si el canal era el de registro
            if (channel.id === client.config.main.loggingChannel) {

                //Borra la configuración y descarga el canal
                client.config.main.loggingChannel = '';
                client.loggingChannel = null;

                //Advertir por consola
                console.warn(`${new Date().toLocaleString()} 》${locale.missingLoggingChannel}.`);

                //Graba la nueva configuración en el almacenamiento
                await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
            };
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.eventError.run(client, error);
    };
};

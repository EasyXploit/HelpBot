//Función para gestionar el envío de registros al canal de registro
exports.run = async (client, type, content) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.logging;

    //Comprobar si el canal está configurado y almacenado en memoria
    if (client.config.main.loggingChannel && client.loggingChannel) {

        try {

            //Carga los permisos del bot en el canal de logging
            const channelPermissions = client.loggingChannel.permissionsFor(client.user);
            const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000) || (channelPermissions & BigInt(0x8000)) !== BigInt(0x8000));

            //Comprueba si el bot tiene permisos para mandar el contenido
            if (!missingPermission) {

                //Envía el contenido al canal, en función del tipo
                switch (type) {
                    case 'embed': await client.loggingChannel.send({ embeds: [content] }); break;
                    case 'file': await client.loggingChannel.send({ files: [content] }); break;
                    case 'text': await client.loggingChannel.send({ text: [content] }); break;
                    default: break;
                };

            } else {

                //Advertir por consola de que no se tienen permisos
                console.error(`${new Date().toLocaleString()} 》${await client.functions.utilities.parseLocale.run(locale.cannotSend, { botUser: client.user.username })}.`);
            };

        } catch (error) {

            //Si el canal no es accesible
            if (error.toString().includes('Unknown Channel')) {

                //Borrarlo de la config y descargarlo de la memoria
                client.config.main.loggingChannel = '';
                client.loggingChannel = null;

                //Advertir por consola
                console.error(`${new Date().toLocaleString()} 》${locale.cannotAccess}.`);

                //Graba la nueva configuración en el almacenamiento
                await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });
            } else {

                //Muestra un error por consola
                console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
            };
        };
    };
};
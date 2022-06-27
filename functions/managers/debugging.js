//Función para gestionar el envío de registros al canal de depuración
exports.run = async (client, type, content) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.debugging;
        
    //Comprobar si el canal está configurado y almacenado en memoria
    if (client.config.main.debuggingChannel && client.debuggingChannel) {

        try {

            //Carga los permisos del bot en el canal de debugging
            const channelPermissions = client.debuggingChannel.permissionsFor(client.user);
            const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000) || (channelPermissions & BigInt(0x8000)) !== BigInt(0x8000));

            //Comprueba si el bot tiene permisos para mandar el contenido
            if (!missingPermission) {

                //Envía el contenido al canal, en función del tipo
                switch (type) {
                    case 'embed': await client.debuggingChannel.send({ embeds: [content] }); break;
                    case 'file': await client.debuggingChannel.send({ files: [content] }); break;
                    case 'text': await client.debuggingChannel.send({ text: [content] }); break;
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
                client.config.main.debuggingChannel = '';
                client.debuggingChannel = null;

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
//Función para gestionar el envío de registros al canal de registro
exports.run = async (client, logType, contentType, content, attachments) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.logging;

    try {

        //Almacena los ajustes para este registro
        const logSettings = await client.functions.db.getConfig.run(`logging.${logType}`);

        //Si el registro no está habilitado, aborta
        if (!logSettings.enabled) return false;

        //Busca el canal configurado para enviar el registro
        const logChannel = await client.functions.utilities.fetch.run(client, 'channel', logSettings.channelId);

        //Si el canal no se encuentra
        if (!logChannel) {

            //Deshabilita el registro
            await client.functions.db.setConfig.run(`logging.${logType}.enabled`, false);

            //Elimina el ID del canal de la base de datos
            await client.functions.db.setConfig.run(`logging.${logType}.channelId`, '');

            //Advierte por consola de que el canal no existe
            console.error(`${new Date().toLocaleString()} 》${locale.cannotAccess}.`);

            //Devuelve un estado incorrecto
            return false;
        };

        //Comprueba si al bot le faltan permisos en el canal de reportes
        const missingPermissions = await client.functions.utilities.missingPermissions.run(client, logChannel, logChannel.guild.me, ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES']);

        //Si le faltaron permisos al bot
        if (missingPermissions) {

            //Deshabilita el registro
            await client.functions.db.setConfig.run(`logging.${logType}.enabled`, false);

            //Advierte por consola de que no se tienen permisos
            console.error(`${new Date().toLocaleString()} 》${await client.functions.utilities.parseLocale.run(locale.cannotSend, { botUser: client.user.username, missingPermissions: missingPermissions })}.`);

            //Devuelve un estado incorrecto
            return false;
        };

        //Envía el contenido al canal, en función del tipo
        switch (contentType) {
            case 'embed': await logChannel.send({ embeds: [content], files: [attachments ? attachments : null] }); break;
            case 'text': await logChannel.send({ text: [content], files: [attachments ? attachments : null] }); break;
            case 'file': await logChannel.send({ files: [content] }); break;
            default: return false;
        };

    } catch (error) {

        //Muestra un error por consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);

        //Devuelve un estado erróneo
        return false;
    };

    //Devuelve un estado correcto
    return true;
};
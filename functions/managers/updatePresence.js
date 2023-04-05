exports.run = async (client) => {

    try {

        //Almacena las traducciones
        const locale = client.locale.functions.managers.updatePresence;

        //Almacena la configuración de presencia
        const presenceConfig = await client.functions.db.getConfig.run('presence');

        //Genera el nuevo string para la actividad
        const presenceName = (async () => {

            //Almacena una cadena que contendrá el texto a mostrar
            let showText = '';

            //Si el conteo de miembros está habilitado
            if (presenceConfig.membersCount) {

                //Cualcula los miembros que tiene la guild
                const membersCount = await client.baseGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size);

                //Concatena el string traducido a la cadena de resultado
                showText += await client.functions.utilities.parseLocale.run(locale.membersCount, { memberCount: membersCount });
            };

            //Si el string tendrá dos campos, añade un separador
            if (showText.length > 0 && presenceConfig.showText && presenceConfig.showText.length > 0) showText += ' | '; 

            //Si hay texto adicional a mostrar, lo concatena
            if (presenceConfig.showText && presenceConfig.showText.length > 0) showText += presenceConfig.showText;

            //Devuelve el resultado
            return showText;

        })();

        //Actualiza la presencia del bot
        await client.user.setPresence({
            status: presenceConfig.status,
            activities: [{
                name: await presenceName,
                type: presenceConfig.type
            }]
        });

    } catch (error) {

        //Si no se pudo obtener los miembros por un error temporal, aborta
        if (error.toString().includes('Members didn\'t arrive in time')) return;

        //Registra el error
        logger.error(error.stack);
    };
};

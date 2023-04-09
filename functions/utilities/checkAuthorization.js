//Función para comprobar si un usuario está autorizado para ejecutar una acción
exports.run = async (member, authorizations) => {

    //Parámetros admisibles:
    //{ guildOwner: true, botManagers: true, bypassIds: []}

    //Almacena el estado de autorización
    let authorizationStatus = false;

    //Por cada unos de la parámetros proporcionados
    for (const parameter in authorizations) {

        //Almacena el valor del parámetro proporcionado
        const parameterValue = authorizations[parameter];

        //Si se trata del parámetro "guildOwner" y tiene un valor booleano
        if (parameter === 'guildOwner' && typeof parameterValue == 'boolean') {

            //Si el miembro es el dueño de la guild, autoriza la operación y aborta el bucle
            if (client.baseGuild.ownerId === member.id) return authorizationStatus = true;

        //Si se trata del parámetro "botManager" y tiene un valor booleano
        } else if (parameter === 'botManager' && typeof parameterValue == 'boolean') {

            //Por cada uno de los IDs (de rol o usuario) administradores del bot
            for (const botManagerId of await client.functions.db.getConfig.run('system.botManagers')) {

                //Si no es un un número, omite la iteración
                if (isNaN(botManagerId)) continue;

                //Si el ID del miembro coincide con el ID iterado, autoriza la operación y aborta el bucle
                if (member.id === botManagerId) return authorizationStatus = true;

                //Si el miembro tiene un rol que coincide con el ID iterado, autoriza la operación y aborta el bucle
                if (member.roles.cache.some(role => role.id === botManagerId)) return authorizationStatus = true;
            };

        //Si se trata del parámetro "bypassIds" y su valor es un array con al menos un item
        } else if (parameter === 'bypassIds' && Array.isArray(parameterValue) && parameterValue.length > 0) {

            //Por cada uno de los IDs (de rol o usuario) que tendrán permiso
            for (const bypassId of parameterValue) {

                //Si se permite a todo el mundo, autoriza la operación y aborta el bucle
                if (bypassId === 'everyone') return authorizationStatus = true;

                //Si no es un un número, omite la iteración
                if (isNaN(bypassId)) continue;

                //Si el ID del miembro coincide con el ID iterado, autoriza la operación y aborta el bucle
                if (member.id === bypassId) return authorizationStatus = true;

                //Si el miembro tiene un rol que coincide con el ID iterado, autoriza la operación y aborta el bucle
                if (member.roles.cache.some(role => role.id === bypassId)) return authorizationStatus = true;
            };
        };

        //Si ya se autorizó la operación, omite el resto del bucle
        if (authorizationStatus) break;
    };

    //Devuelve el estado de la autorización
    return authorizationStatus;
};

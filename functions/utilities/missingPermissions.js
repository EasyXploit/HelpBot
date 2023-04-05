//Función para evaluar si el bot o un miembro tiene un conjunto de permisos en un canal o la guild
exports.run = async (client, targetChannel, targetMember, requiredPermissions) => {

    try {

        //Devuelve "falso" si no se han proporcionado los campos requeridos
        if (!client || !requiredPermissions) return false;

        //Crea un array para los permisos no disponibles para el miembro
        let permissionsNotGranted = [];

        //Por cada uno de los permisos requeridos
        requiredPermissions.forEach(async (permission) => {

            //Almacena los bits de dicho permiso
            const permissionBits = new client.Permissions(permission).bitfield;
        
            //Almacena los permisos del miembro en el canal objetivo o en la guild si no se proporciona canal
            const memberPermissions = targetChannel ? targetMember.permissionsIn(targetChannel) : targetMember.permissions;

            //Si el miembro no tiene ese permiso en el canal/guild, almacena el permiso traducido (o sin  traducir si no se encuentra)
            if ((memberPermissions & permissionBits) !== permissionBits) permissionsNotGranted.push(client.locale.permissions[permission] ? client.locale.permissions[permission] : permission);
        });
        
        //Si hubieron permisos indisponibles, los devuelve
        if (typeof permissionsNotGranted !== 'undefined' && permissionsNotGranted.length > 0) return permissionsNotGranted;

        //En caso contrario, devuelve "falso"
        else return false;

    } catch (error) {

        //Muestra un error por consola
        console.error(`${new Date().toLocaleString()} 》`, error.stack);
    };
};

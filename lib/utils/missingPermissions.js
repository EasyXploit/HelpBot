//Función para evaluar si el bot o un miembro tiene un conjunto de permisos en un canal o la guild
export default async (targetChannel, targetMember, requiredPermissions, defaultLocale) => {

    try {

        //Devuelve "falso" si no se han proporcionado los campos requeridos
        if (!requiredPermissions) return false;

        //Almacena las traducciones de los permisos, o su versión por defecto si se especifica
        const locale = defaultLocale ? require('./locales/en-us.json').permissions : client.locale.permissions;

        //Crea un array para los permisos no disponibles para el miembro
        let permissionsNotGranted = [];

        //Por cada uno de los permisos requeridos
        requiredPermissions.forEach(async (permission) => {

            //Almacena los bits de dicho permiso
            const permissionBits = new discord.Permissions(permission).bitfield;
        
            //Almacena los permisos del miembro en el canal objetivo o en la guild si no se proporciona canal
            const memberPermissions = targetChannel ? targetMember.permissionsIn(targetChannel) : targetMember.permissions;

            //Si el miembro no tiene ese permiso en el canal/guild, almacena el permiso traducido (o sin traducir si no se encuentra)
            if ((memberPermissions & permissionBits) !== permissionBits) permissionsNotGranted.push(locale[permission] ? locale[permission] : client.functions.utils.capitalize(permission));
        });
        
        //Si hubieron permisos indisponibles, los devuelve
        if (typeof permissionsNotGranted !== 'undefined' && permissionsNotGranted.length > 0) return permissionsNotGranted;

        //En caso contrario, devuelve "falso"
        else return false;

    } catch (error) {

        //Muestra un error por consola
        logger.error(error.stack);
    };
};

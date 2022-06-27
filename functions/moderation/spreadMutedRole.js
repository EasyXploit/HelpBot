//Función para propagar el rol silenciado
exports.run = async (client, guild) => {

    //Busca el rol silenciado
    let mutedRole = await guild.roles.cache.find(role => role.id === client.config.dynamic.mutedRoleId);

    //Para cada canal, añade el permiso para el rol
    await guild.channels.cache.forEach(async (channel) => {

        //Ignora este canal si debe estar excluido del silenciamiento
        if (client.config.moderation.mutedRoleExcludedChannels.includes(channel.id)) return;

        //Ignora este canal si se trata de canal sin permisos propios (e.g. hilos)
        if (!channel.permissionOverwrites) return;

        //Si el canal tiene un permiso para el rol silenciado, lo almacena
        const mutedRolePermissions = channel.permissionOverwrites.resolve(mutedRole.id);

        //Si el canal no tiene el permiso y el bitfield no coincide con las negaciones pertinentes, añade el permiso
        if (!mutedRolePermissions || ((mutedRolePermissions.deny & BigInt(0x800)) !== BigInt(0x800) || (mutedRolePermissions.deny & BigInt(0x40)) !== BigInt(0x40)) || ((mutedRolePermissions.deny & BigInt(0x200000)) !== BigInt(0x200000))) {
            
            //Cambia los permisos del rol
            await channel.permissionOverwrites.edit(mutedRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                CREATE_PUBLIC_THREADS: false,
                CREATE_PRIVATE_THREADS: false,
                SEND_MESSAGES_IN_THREADS: false,
                START_EMBEDDED_ACTIVITIES: false,
                CONNECT: false
            });
        };
    });
};
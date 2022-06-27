//Función para comprobar si existe el rol silenciado, y de no existir, crearlo
exports.run = async (client, guild) => {

    //Almacena las traducciones
    const locale = client.locale.functions.moderation.checkMutedRole;

    //Busca el rol silenciado
    let mutedRole = await guild.roles.fetch(client.config.dynamic.mutedRoleId);

    //Si no existe el rol silenciado (o su nombre es diferente al configurado), lo crea
    if (!mutedRole || mutedRole.name !== client.config.moderation.mutedRoleName) {

        //Borra el anterior rol si es necesario
        if (mutedRole && mutedRole.name !== client.config.moderation.mutedRoleName) await mutedRole.delete(locale.replacing);

        //Crea un nuevo rol silenciado
        mutedRole = await guild.roles.create({
            name: client.config.moderation.mutedRoleName,
            color: client.config.colors.mutedRole,
            permissions: [],
            reason: locale.reason
        });
        
        //Asigna el rol a la posición más alta posible
        const botMember = await guild.members.cache.get(client.user.id);
        await mutedRole.setPosition(botMember.roles.highest.position - 1);

        //Graba el nuevo rol en la configuración
        client.config.dynamic.mutedRoleId = mutedRole.id;

        //Graba el ID en el fichero de configuración
        await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });

        //Por cada ID de miembro en la base de datos de muteos
        for (const memberId in client.db.mutes) {

            //Busca y almacena el miembro
            const member = await client.functions.utilities.fetch.run(client, 'member', memberId);

            //Añade el rol silenciado al miembro
            await member.roles.add(mutedRole);
        };
    };
    
    //Devuelve el rol silenciado
    return mutedRole;
};
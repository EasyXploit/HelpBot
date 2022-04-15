exports.run = async (oldMember, newMember, client) => {
    
    try {

        //Si el miembro ha pasado la pantalla de verificación
        if (oldMember.pending && !newMember.pending) {

            //Si el miembro tiene entradas en la tabla de estadísticas, asigna las recompensas que le corresponda
            if (client.db.stats[newMember.id] && client.config.xp.preserveStats) client.functions.assignRewards(newMember, client.db.stats[newMember.id].level);

            //Si el miembro tiene un silenciamiento en vigor
            if (client.db.mutes[newMember.id]) {

                //Comprueba si existe el rol silenciado, sino lo crea
                const mutedRole = await client.functions.checkMutedRole(newMember.guild);

                //Añade el rol silenciado al miembro
                await newMember.roles.add(mutedRole);

                //Propaga el rol silenciado
                client.functions.spreadMutedRole(newMember.guild);
            };

            //Ejecuta el manejador de nuevos miembros (si procede)
            if (client.config.main.newMemberMode === 'after') client.functions.manageNewMember(newMember);
        };

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.eventErrorHandler(error, 'guildMemberUpdate');
    };
};

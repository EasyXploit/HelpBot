exports.run = async (oldMember, newMember, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (oldMember.guild.id !== client.homeGuild.id) return;

        //Si el miembro ha pasado la pantalla de verificación
        if (oldMember.pending && !newMember.pending) {

            //Si el miembro tiene entradas en la tabla de estadísticas, asigna las recompensas que le corresponda
            if (client.db.stats[newMember.id] && client.config.xp.preserveStats) await client.functions.leveling.assignRewards.run(client, newMember, client.db.stats[newMember.id].level);

            //Si el miembro tiene un silenciamiento en vigor
            if (client.db.mutes[newMember.id]) {

                //Comprueba si existe el rol silenciado, sino lo crea
                const mutedRole = await client.functions.moderation.checkMutedRole.run(client, newMember.guild);

                //Añade el rol silenciado al miembro
                await newMember.roles.add(mutedRole);

                //Propaga el rol silenciado
                await client.functions.moderation.spreadMutedRole.run(client);
            };

            //Ejecuta el manejador de nuevos miembros (si procede)
            if (client.config.main.newMemberMode === 'after') await client.functions.managers.newMember.run(client, newMember);
        };

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError.run(client, error, 'guildMemberUpdate');
    };
};

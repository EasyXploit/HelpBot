//Función para asignar recompensas
export default async (member, memberLevel, updateSubsequents) => {

    //Función para comparar un array
    function compare(a, b) {
        if (a.requiredLevel > b.requiredLevel) return 1;
        if (a.requiredLevel < b.requiredLevel) return -1;
        return 0;
    };

    //Almacena las recompensas por subir de nivel
    const levelingRewards = await client.functions.db.getConfig('leveling.rewards');

    //Compara y ordena el array de recompensas
    const sortedRewards = levelingRewards.sort(compare);

    //Almacena los roles de recompensa a asignar
    let toReward = [];

    //Por cada una de las recompensas disponibles en la config.
    for (let index = 0; index < sortedRewards.length; index++) {

        //Almacena la recompensa iterada
        const reward = sortedRewards[index];

        //Si la recompensa sobrepasa el nivel del miembro, para el bucle
        if (!updateSubsequents && reward.requiredLevel > memberLevel) break;

        //Almacena si se deben eliminar las recompensas anteriores
        const removePreviousRewards = await client.functions.db.getConfig('leveling.removePreviousRewards');

        //Por cada uno de los roles de dicha recompensa
        reward.roles.forEach(async role => {

            //Si no se deben preservar viejas recompensas
            if ((removePreviousRewards && !(sortedRewards[index + 1] && reward.requiredLevel < memberLevel && sortedRewards[index + 1].requiredLevel > memberLevel) && index !== (sortedRewards.length - 1)) || reward.requiredLevel > memberLevel) {

                //Comprueba si el bot tiene los permisos requeridos, y de ser así, le elimina el rol al miembro si lo tiene
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.me, ['MANAGE_ROLES']);
                if (missingPermissions) logger.warn(`The bot could not remove the reward role to ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else if (member.roles.cache.has(role)) await member.roles.remove(role);
            };
        });

        //Omite esta iteración si el nivel de la recompensa es superior al nivel del miembro 
        if (reward.requiredLevel > memberLevel) continue;

        //Si el miembro puede stackear todas las recompensas, o tiene el nivel de esta, se almacena
        if (!removePreviousRewards || reward.requiredLevel === memberLevel || (reward.requiredLevel < memberLevel && index === (sortedRewards.length - 1))) toReward = toReward.concat(reward.roles);

        //Si el miembro tiene cómo mínimo el nivel de la recompensa anterior, esta se almacena
        if (removePreviousRewards && sortedRewards[index + 1] && reward.requiredLevel < memberLevel && memberLevel < sortedRewards[index + 1].requiredLevel) toReward = toReward.concat(reward.roles);
    };

    //Si hubieron roles a asignar
    if (toReward.length > 0) {

        //Almacena los roles recompensados
        let rewarded = [];

        //Asigna cada uno de ellos
        toReward.forEach(async role => {

            //Si el miembro aún no tiene el rol
            if (!member.roles.cache.has(role)) {

                //Comprueba si el bot tiene los permisos requeridos, y de ser así, le añade el rol al miembro
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.me, ['MANAGE_ROLES']);
                if (missingPermissions) logger.warn(`The bot could not add the reward role to ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else {

                    //Añade el rol al miembro
                    await member.roles.add(role);

                    //Almacena el rol recompensado
                    rewarded.push(role);
                };
            };
        });

        //Devuelve los roles recompensados
        if (rewarded.length > 0) return toReward;
    };
};
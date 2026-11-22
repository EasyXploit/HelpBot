//Función para asignar al miembro las recompensas que le corresponden según su nivel (y quitarle las que no)
exports.run = async (member, memberLevel, updateSubsequents) => {

    //Función para comparar un array
    function compare(a, b) {
        if (a.requiredLevel > b.requiredLevel) return 1;
        if (a.requiredLevel < b.requiredLevel) return -1;
        return 0;
    };

    //Compara y ordena el array de recompensas
    const sortedRewards = client.config.levelingRewards.sort(compare);

    //Almacena si se deben quitar las recompensas anteriores
    const removePreviousRewards = client.config.leveling.removePreviousRewards;

    //Almacena las recompensas alcanzadas por el miembro
    const reachedRewards = sortedRewards.filter(reward => reward.requiredLevel <= memberLevel);

    // Almacena el nivel de la última recompensa alcanzada, o 0 si no hay ninguna
    const lastReachedLevel = reachedRewards.length > 0 ? reachedRewards[reachedRewards.length - 1].requiredLevel : 0;

    //Almacena los roles que debe tener el miembro: los de todas las recompensas alcanzadas, o solo los del último nivel alcanzado si se deben quitar las anteriores
    const rolesToHave = new Set(reachedRewards.filter(reward => !removePreviousRewards || reward.requiredLevel === lastReachedLevel).flatMap(reward => reward.roles));

    //Almacena los roles que no debe tener el miembro: los de las recompensas superiores a su nivel (si se deben actualizar), y los de las recompensas anteriores (si se deben quitar), salvo los que debe tener
    const rolesToRemove = new Set(sortedRewards.filter(reward => (updateSubsequents && reward.requiredLevel > memberLevel) || (removePreviousRewards && reward.requiredLevel < lastReachedLevel)).flatMap(reward => reward.roles).filter(role => !rolesToHave.has(role)));

    //Por cada uno de los roles que no debe tener el miembro, se lo quita si lo tiene
    for (const role of rolesToRemove) if (member.roles.cache.has(role)) await member.roles.remove(role).catch(error => console.error(`${new Date().toLocaleString()} 》${client.locale.functions.managers.eventError.error}:`, error.stack));

    //Almacena los roles recompensados
    const rewarded = [];

    //Por cada uno de los roles que debe tener el miembro
    for (const role of rolesToHave) {

        //Omite el rol si el miembro ya lo tiene
        if (member.roles.cache.has(role)) continue;

        try {

            //Le añade el rol
            await member.roles.add(role);

            //Almacena el rol recompensado
            rewarded.push(role);

        } catch (error) {

            //Muestra el error en la consola (por ejemplo, si el rol ya no existe o está por encima del rol del bot) y continúa con el resto
            console.error(`${new Date().toLocaleString()} 》${client.locale.functions.managers.eventError.error}:`, error.stack);
        };
    };

    //Devuelve los roles recompensados, si los hay
    if (rewarded.length > 0) return rewarded;
};

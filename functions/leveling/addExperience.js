//Función para añadir XP (mode = message || voice)
exports.run = async (client, member, mode, channel) => {

    //Almacena las traducciones
    const locale = client.locale.functions.leveling.addExperience;

    //Para comprobar si el rol puede ganar XP o no.
    let nonXP;

    //Para cada rol que tiene prohibido ganar XP
    for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {

        //Si el miembro tiene dicho rol
        if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {

            //Ajusta la variable de estado
            nonXP = true;

            //Para el bucle
            break;
        };
    };

    //Devuelve si no se puede ganar XP
    if (nonXP) return;

    //Si el miembro no tiene tabla de XP
    if (!client.db.stats[member.id]) {

        //Crea la tabla del miembro
        client.db.stats[member.id] = {
            totalXP: 0,
            actualXP: 0,
            level: 0,
            lastMessage: 0,
            aproxVoiceTime: 0,
            notifications: {
                public: true,
                private: true
            }
        };
    };

    //Almacena las stats del miembro
    const memberStats = client.db.stats[member.id];

    //Genera XP si es un canal de voz o si se ha sobrepasado el umbral de cola de mensajes
    if (mode === 'voice' || (mode === 'message' && Date.now() - memberStats.lastMessage > client.config.xp.minimumTimeBetweenMessages)) {

        //Genera XP aleatorio según los rangos
        const newXp = await client.functions.utilities.randomIntBetween.run(client.config.xp.minimumXpReward, client.config.xp.maximumXpReward);

        //Añade el XP a la cantidad actual del miembro
        memberStats.actualXP += newXp;
        memberStats.totalXP += newXp;

        //Si es un mensaje, actualiza la variable para evitar spam
        if (mode === 'message') memberStats.lastMessage = Date.now();

        //Si es un intervalo de voz, concatena la duración de un intervalo de voz en las stats del miembro
        if (mode === 'voice') memberStats.aproxVoiceTime += client.config.xp.XPGainInterval;

        //Fórmula para calcular el XP necesario para subir al siguiente nivel
        const xpToNextLevel = await client.functions.leveling.getXpToLevel.run(client, memberStats.level + 1)

        //Comprueba si el miembro ha de subir de nivel
        if (memberStats.totalXP >= xpToNextLevel) {

            //Ajusta el nivel del miembro
            memberStats.level++;

            //Ajusta el XP actual de miembro
            memberStats.actualXP = xpToNextLevel - memberStats.totalXP;

            //Asigna las recompensas correspondientes al nivel (si corresponde), y almacena los roles recompensados
            const rewardedRoles = await client.functions.leveling.assignRewards.run(client, member, memberStats.level);

            //Genera un embed de subida de nivel
            let levelUpEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setAuthor({ name: locale.levelUpEmbed.author, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.levelUpEmbed.description, { member: member, memberLevel: memberStats.level })}.`);

            //Genera una fila de botones
            const buttonsRow = new client.MessageActionRow();
            
            //Añade un botón a la filla, si se trata del modo voz
            if (mode === 'voice') buttonsRow.addComponents(

                //Genera un botón para activar o desactivar las notificaciones
                new client.MessageButton()
                    .setLabel(locale.levelUpEmbed.disablePrivateNotification)
                    .setStyle('SECONDARY')
                    .setCustomId('updateNotifications')
            );

            //Si se recompensó al miembro con roles
            if (rewardedRoles) {

                //Almacena los nombres de los roles
                const roleNames = [];

                //Por cada uno de los roles recompensados
                for (const roleId of rewardedRoles) {

                    //Busca el rol en la guild
                    const fetchedRole = await client.functions.utilities.fetch.run(client, 'role', roleId);

                    //Sube al array de nombre, el nombre del rol iterado
                    roleNames.push(fetchedRole.name);
                };

                //Añade un campo al embed de levelup con los roles recompensados
                levelUpEmbed.addField(locale.levelUpEmbed.rewards, `\`${roleNames.join('`, `')}\``);
            };

            //Manda el mensaje de subida de nivel, si se ha configurado
            if (mode === 'message' && client.config.xp.notifylevelUpOnChat && memberStats.notifications.public) channel.send({ embeds: [levelUpEmbed] });
            if (mode === 'voice' && client.config.xp.notifylevelUpOnVoice && memberStats.notifications.private) member.send({ embeds: [levelUpEmbed], components: [buttonsRow] });
        };

        //Guarda las nuevas estadísticas del miembro en la base de datos
        client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
            if (err) throw err;
        });
    };
};
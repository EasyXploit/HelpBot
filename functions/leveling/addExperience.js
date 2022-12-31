//Función para añadir XP (mode = message || voice)
exports.run = async (client, member, mode, channel) => {

    //Almacena las traducciones
    const locale = client.locale.functions.leveling.addExperience;

    //Para comprobar si el rol puede ganar XP o no.
    const notAuthorizedToEarnXp = await client.functions.utilities.checkAuthorization.run(client, member, { bypassIds: client.config.leveling.wontEarnXP });

    //Devuelve si no se puede ganar XP
    if (notAuthorizedToEarnXp) return;

    //Si no se puede ganar XP en el canal, aborta
    if (client.config.leveling.nonXPChannels.includes(channel.id)) return;

    //Si el miembro no tiene tabla de stats
    if (!client.db.stats[member.id]) {

        //Crea la tabla del miembro
        client.db.stats[member.id] = {
            experience: 0,
            level: 0,
            lastMessage: 0,
            aproxVoiceTime: 0,
            messagesCount: 0,
            notifications: {
                public: true,
                private: true
            }
        };
    };

    //Almacena las stats del miembro
    const memberStats = client.db.stats[member.id];

    //Genera XP aleatorio según los rangos
    const newXp = await client.functions.utilities.randomIntBetween.run(client.config.leveling.minimumXpReward, client.config.leveling.maximumXpReward);

    //Añade el XP a la cantidad actual del miembro
    memberStats.experience += newXp;

    //Calcula el XP necesario para subir al siguiente nivel
    const neededExperience = await client.functions.leveling.getNeededExperience.run(client, memberStats.experience);

    //Comprueba si el miembro ha de subir de nivel
    if (neededExperience.nextLevel > memberStats.level) {

        //Ajusta el nivel del miembro
        memberStats.level++;

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
            levelUpEmbed.addFields({ name: locale.levelUpEmbed.rewards, value: `\`${roleNames.join('`, `')}\`` });
        };

        //Manda el mensaje de subida de nivel, si se ha configurado
        if (mode === 'message' && client.config.leveling.notifylevelUpOnChat && memberStats.notifications.public) channel.send({ embeds: [levelUpEmbed] });
        if (mode === 'voice' && client.config.leveling.notifylevelUpOnVoice && memberStats.notifications.private) member.send({ embeds: [levelUpEmbed], components: [buttonsRow] });
    };

    //Guarda las nuevas estadísticas del miembro en la base de datos
    client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
        if (err) throw err;
    });
};

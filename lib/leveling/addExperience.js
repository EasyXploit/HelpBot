//Función para añadir XP (mode = message || voice)
export default async (member, mode, channel) => {

    //Almacena las traducciones
    const locale = client.locale.functions.leveling.addExperience;

    //Para comprobar si el rol puede ganar XP o no.
    const notAuthorizedToEarnXp = await client.functions.utils.checkAuthorization(member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

    //Devuelve si no se puede ganar XP
    if (notAuthorizedToEarnXp) return;

    //Almacena los canales que no pueden generar XP
    const nonXPChannels = await client.functions.db.getConfig('leveling.nonXPChannels');

    //Si no se puede ganar XP en el canal, aborta
    if (nonXPChannels.includes(channel.id)) return;

    //Almacena el perfil del miembro, o lo crea
    let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });
    
    //Almacena las estadísticas del miembro
    let memberStats = memberProfile.stats;

    //Genera XP aleatorio según los rangos
    const newXp = await client.functions.utils.randomIntBetween(await client.functions.db.getConfig('leveling.minimumXpReward'), await client.functions.db.getConfig('leveling.maximumXpReward'));

    //Añade el XP a la cantidad actual del miembro
    memberStats.experience += newXp;

    //Calcula el XP necesario para subir al siguiente nivel
    const neededExperience = await client.functions.leveling.getNeededExperience(memberStats.experience);

    //Comprueba si el miembro ha de subir de nivel
    if (neededExperience.nextLevel > memberStats.level) {

        //Ajusta el nivel del miembro
        memberStats.level++;

        //Asigna las recompensas correspondientes al nivel (si corresponde), y almacena los roles recompensados
        const rewardedRoles = await client.functions.leveling.assignRewards(member, memberStats.level);

        //Genera un embed de subida de nivel
        let levelUpEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setAuthor({ name: locale.levelUpEmbed.author, iconURL: member.user.displayAvatarURL() })
            .setDescription(`${await client.functions.utils.parseLocale(locale.levelUpEmbed.description, { member: member, memberLevel: memberStats.level })}.`);

        //Genera una fila de botones
        const buttonsRow = new discord.ActionRowBuilder();
        
        //Añade un botón a la filla, si se trata del modo voz
        if (mode === 'voice') buttonsRow.addComponents(

            //Genera un botón para activar o desactivar las notificaciones
            new discord.ButtonBuilder()
                .setLabel(locale.levelUpEmbed.disablePrivateNotification)
                .setStyle(discord.ButtonStyle.Secondary)
                .setCustomId('updateNotifications')
        );

        //Si se recompensó al miembro con roles
        if (rewardedRoles) {

            //Almacena los nombres de los roles
            const roleNames = [];

            //Por cada uno de los roles recompensados
            for (const roleId of rewardedRoles) {

                //Busca el rol en la guild
                const fetchedRole = await client.functions.utils.fetch('role', roleId);

                //Sube al array de nombre, el nombre del rol iterado
                roleNames.push(fetchedRole.name);
            };

            //Añade un campo al embed de levelup con los roles recompensados
            levelUpEmbed.addFields({ name: locale.levelUpEmbed.rewards, value: `\`${roleNames.join('`, `')}\`` });
        };

        //Almacena la configuración global de niveles
        const levelingConfig = await client.functions.db.getConfig('leveling');

        //Si se ha configurado el mensaje de subida de nivel público
        if (mode === 'message' && levelingConfig.notifylevelUpOnChat && memberProfile.notifications.public) {

            //Comprueba si el bot tiene los permisos requeridos, y de ser así, envía el mensaje
            const missingPermissions = await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['SendMessages', 'EmbedLinks']);
            if (missingPermissions) logger.warn(`The bot could not send a level-up message for ${member.user.tag} (${member.id}) in ${channel.name} (${channel.id}) because it did not have the "Send Messages" and/or "Embed Links" permissions on that channel`);
            else channel.send({ embeds: [levelUpEmbed] });
        };

        //Si se ha configurado el mensaje de subida de nivel privado, lo envía
        if (mode === 'voice' && levelingConfig.notifylevelUpOnVoice && memberProfile.notifications.private) member.send({ embeds: [levelUpEmbed], components: [buttonsRow] });
    };

    //Guarda las nuevas estadísticas del miembro en la base de datos
    await client.functions.db.setData('profile', member.id, memberProfile);
};

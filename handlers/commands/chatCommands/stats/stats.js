exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca el miembro en la guild
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : interaction.member.id);

        //Si no se encuentra, devuelve un error
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});

        //Devuelve un error si el miembro no tiene stats
        if (!client.db.stats[member.id]) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noXp, { member: member })}.`)
        ], ephemeral: true});
        
        //Almacena las stats del miembro
        const memberStats = client.db.stats[member.id];

        //Para comprobar si el rol puede ganar XP o no.
        const notAuthorizedToEarnXp = await client.functions.utilities.checkAuthorization.run(client, member, { bypassIds: client.config.leveling.wontEarnXP });

        //Función para comparar un array
        function compare(a, b) {
            if (a.requiredLevel > b.requiredLevel) return 1;
            if (a.requiredLevel < b.requiredLevel) return -1;
            return 0;
        };

        //Compara y ordena el array de recompensas
        const sortedRewards = client.config.levelingRewards.sort(compare);

        //Almacena los próximos roles recompensados
        let nextRewardedRoles = {};

        //Por cada recompensa
        for (let index = 0; index < sortedRewards.length; index++) {

            //Si el nivel requerido es mayor o igual al siguiente nivel del miembro
            if (sortedRewards[index].requiredLevel >= (memberStats.level + 1)) {

                //Almacena los roles de la próxima recompensa
                nextRewardedRoles.roles = sortedRewards[index].roles;
                nextRewardedRoles.requiredLevel = sortedRewards[index].requiredLevel

                //Para el bucle
                break;
            };
        };

        //Almacena la próxima recompensa por defecto
        let nextRewards = locale.defaultReward;

        //Si se encontró una próxima recompensa
        if (nextRewardedRoles.roles) {

            //Almacena los nombres de los roles de la recompensa
            let roleNames = []; 

            //Crea una promesa para que se resuelva cuando haya acabado de buscar los nombres de todos los roles
            const getRewards = new Promise((resolve, reject) => {

                //Para cada ID de rol, busca su nombre
                nextRewardedRoles.roles.forEach(async (value, index, array) => {

                    //Busca y almacena el rol
                    const role = await interaction.guild.roles.fetch(value);

                    //Sube al array de nombres, el nombre del rol iterado
                    roleNames.push(role.name);

                    //Se resuelve la promesa si todos los roles se han encontrado
                    if (index === array.length -1) resolve();
                });
            });
            
            //Invoca la promesa para obtener los nombres de los roles
            await getRewards.then(() => {

                //Sobreescribe la variable "nextRewards" con los resultados obtenidos
                nextRewards = `${roleNames.join(', ')} (${locale.statsEmbed.level} ${nextRewardedRoles.requiredLevel})`;
            });
        };

        //Almacena el tiempo de voz aproximado
        const aproxVoiceTime = memberStats.aproxVoiceTime > 0 ? `\`${await client.functions.utilities.msToTime.run(client, memberStats.aproxVoiceTime)}\`` : '\`00:00:00\`';

        //Calcula el XP necesario por defecto para el siguiente nivel
        const neededExperience = await client.functions.leveling.getNeededExperience.run(client, memberStats.experience);

        //Envía el mensaje con las estadísticas
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setTitle(`🥇 ${locale.statsEmbed.title}`)
            .setDescription(await client.functions.utilities.parseLocale.run(locale.statsEmbed.description, { memberTag: member.user.tag }))
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addFields(
                { name: locale.statsEmbed.actualLevel, value: `\`${memberStats.level}\``, inline: true },
                { name: locale.statsEmbed.experience, value: `\`${memberStats.experience}\``, inline: true },
                { name: locale.statsEmbed.xpToNextLevel, value: notAuthorizedToEarnXp ? `\`${locale.statsEmbed.noXpToNextLevel}\`` : `\`${neededExperience.experience}\``, inline: true },
                { name: locale.statsEmbed.messagesCount, value: `\`${memberStats.messagesCount}\``, inline: true },
                { name: locale.statsEmbed.voiceTime, value: `\`${aproxVoiceTime}\``, inline: true },
                { name: locale.statsEmbed.antiquity, value: `\`${await client.functions.utilities.msToTime.run(client, Date.now() - member.joinedTimestamp)}\``, inline: true },
                { name: locale.statsEmbed.nextRewards, value: notAuthorizedToEarnXp ? `\`${locale.statsEmbed.noNextRewards}\`` : `\`${nextRewards}\``, inline: true }
            )
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: false
            }
        ]
    }
};

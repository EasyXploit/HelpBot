export async function run(interaction, commandConfig, locale) {
    
    try {

        //Busca el miembro en la guild
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : interaction.member.id);

        //Si no se encuentra, devuelve un error
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});
        
        //Almacena el perfil del miembro
        const memberProfile = await client.functions.db.getData('profile', member.id);

        //Devuelve un error si el miembro no tiene perfil
        if (!memberProfile) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noXp, { member: member })}.`)
        ], ephemeral: true});

        //Para comprobar si el rol puede ganar XP o no.
        const notAuthorizedToEarnXp = await client.functions.utils.checkAuthorization(member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

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

        //Almacena los próximos roles recompensados
        let nextRewardedRoles = {};

        //Por cada recompensa
        for (let index = 0; index < sortedRewards.length; index++) {

            //Si el nivel requerido es mayor o igual al siguiente nivel del miembro
            if (sortedRewards[index].requiredLevel >= (memberProfile.stats.level + 1)) {

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
        const aproxVoiceTime = memberProfile.stats.aproxVoiceTime > 0 ? `\`${await client.functions.utils.msToTime(memberProfile.stats.aproxVoiceTime)}\`` : '\`00:00:00\`';

        //Calcula el XP necesario por defecto para el siguiente nivel
        const neededExperience = await client.functions.leveling.getNeededExperience(memberProfile.stats.experience);

        //Envía el mensaje con las estadísticas
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setTitle(`🥇 ${locale.statsEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.statsEmbed.description, { memberTag: member.user.tag }))
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addFields(
                { name: locale.statsEmbed.actualLevel, value: `\`${memberProfile.stats.level}\``, inline: true },
                { name: locale.statsEmbed.experience, value: `\`${memberProfile.stats.experience}\``, inline: true },
                { name: locale.statsEmbed.xpToNextLevel, value: notAuthorizedToEarnXp ? `\`${locale.statsEmbed.noXpToNextLevel}\`` : `\`${neededExperience.experience}\``, inline: true },
                { name: locale.statsEmbed.messagesCount, value: `\`${memberProfile.stats.messagesCount}\``, inline: true },
                { name: locale.statsEmbed.voiceTime, value: `\`${aproxVoiceTime}\``, inline: true },
                { name: locale.statsEmbed.antiquity, value: `\`${await client.functions.utils.msToTime(Date.now() - member.joinedTimestamp)}\``, inline: true },
                { name: locale.statsEmbed.nextRewards, value: notAuthorizedToEarnXp ? `\`${locale.statsEmbed.noNextRewards}\`` : `\`${nextRewards}\``, inline: true }
            )
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    defaultMemberPermissions: null,
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

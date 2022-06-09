exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca el miembro en la guild
        const member = await client.functions.fetchMember(interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : interaction.member.id);

        //Si no se encuentra, devuelve un error
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});

        //Devuelve un error si el miembro no tiene stats
        if (!client.db.stats[member.id]) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.noXp, { member: member })}.`)
        ], ephemeral: true});
        
        //Almacena las stats del miembro
        const memberStats = client.db.stats[member.id];

        //Calcula el XP necesario para pasar al siguiente nivel
        const xpToNextLevel = await client.functions.xpToLevel(memberStats.level + 1);

        //Comprueba si el miembro puede ganar XP
        let nonXP;
        
        //Por cada uno de los roles configurados para no ganar XP
        for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {

            //Comprueba si el miembro tiene el rol iterado
            if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {
                nonXP = true;
                break;
            };
        };

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
                nextRewards = `${roleNames.join(', ')} (lvl ${nextRewardedRoles.requiredLevel})`;
            });
        };

        //Almacena el tiempo de voz aproximado
        const aproxVoiceTime = memberStats.aproxVoiceTime > 0 ? `\`${await client.functions.msToDHHMMSS(memberStats.aproxVoiceTime)}\`` : '\`00:00:00\`';

        //Envía el mensaje con las estadísticas
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setTitle(`🥇 ${locale.statsEmbed.title}`)
            .setDescription(client.functions.localeParser(locale.statsEmbed.description, { memberTag: member.user.tag }))
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField(locale.statsEmbed.actualLevel, `\`${memberStats.level}\``, true)
            .addField(locale.statsEmbed.totalXp, `\`${memberStats.totalXP}\``, true)
            .addField(locale.statsEmbed.xpToNextLevel, nonXP ? `\`${locale.statsEmbed.noXpToNextLevel}\`` : `\`${xpToNextLevel - memberStats.totalXP}\``, true)
            .addField(locale.statsEmbed.voiceTime, nonXP ? `\`${locale.statsEmbed.noVoiceTime}\`` : `\`${aproxVoiceTime}\``, true)
            .addField(locale.statsEmbed.nextRewards, nonXP ? `\`${locale.statsEmbed.noNextRewards}\`` : `\`${nextRewards}\``, true)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
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

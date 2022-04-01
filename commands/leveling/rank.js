exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        let notFoundEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`);

        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send({ embeds: [notFoundEmbed] });

        if (message.guild.id in client.db.stats === false) {
            client.db.stats[message.guild.id] = {};
        };

        const guildStats = client.db.stats[message.guild.id];

        if (member.id in guildStats === false) {
            let noXPEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${member} no tiene puntos de XP`);

            return message.channel.send({ embeds: [noXPEmbed] });
        };
        
        const userStats = guildStats[member.id];
        const xpToNextLevel = (5 * client.config.xp.dificultyModifier) * Math.pow(userStats.level, 3) + 50 * userStats.level + 100;

        let nonXP;
        for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {
            if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {
                nonXP = true;
                break;
            };
        };

        //Función para calcular cual es la siguiente recompensa que le corresponde al miembro
        async function nextReward() {

            //Función para encontrar la siguiente recompensa
            function wichReward() {
                for (let index = 0; index < client.config.levelingRewards.length; index++) {
                    if (client.config.levelingRewards[i].requiredLevel >= userStats.level + 1) return client.config.levelingRewards[index].roles;
                };
            };

            //Busca una posible próxima recompensa
            let nextRewards = wichReward();

            //Próxima recompensa por defecto
            let yourRewards = 'Ninguna';

            //Si se encontró una próxima recompensa
            if (nextRewards) {
                let roleNames = []; //Almacena los nombres de los roles

                //Crea una promesa para que se resuelva cuando haya acabado de buscar los nombres de todos los roles
                const getRewards = new Promise((resolve, reject) => {

                    //Para cada ID de rol, busca su nombre
                    nextRewards.forEach(async (value, index, array) => {
                        const role = await message.guild.roles.fetch(value);
                        roleNames.push(role.name);
                        if (index === array.length -1) resolve();
                    });
                });
                
                //Graba el resultado en la variable "yourRewards"
                await getRewards.then(() => {
                    yourRewards = roleNames.join(', ');
                });
            };

            return yourRewards;
        };

        let resultEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setTitle(`🥇 Rango`)
            .setDescription(`Mostrando el rango del miembro **${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField(`Nivel actual`, `\`${userStats.level}\``, true)
            .addField(`XP Total`, `\`${userStats.totalXP}\``, true)

        if (nonXP) {
            resultEmbed.addField(`XP para el siguiente nivel`, '\`No puedes subir de nivel\`', true);
            resultEmbed.addField(`Siguiente recompensa`, '\`No puedes ganar recompensas\`', true);
        } else {
            resultEmbed.addField(`XP para el siguiente nivel`, `\`${xpToNextLevel - userStats.totalXP}\``, true);
            resultEmbed.addField(`Siguiente recompensa`, `\`${await nextReward()}\``, true);
        };
        
        message.channel.send({ embeds: [resultEmbed] });

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'rank',
    description: 'Muestra tus estadísticas de XP o las de otro miembro.',
    aliases: ['stats'],
    parameters: '[@miembro | id]'
};

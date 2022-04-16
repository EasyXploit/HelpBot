exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Busca el miembro en la guild
        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);

        //Si no se encuentra, devuelve un error
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`)
        ]});

        //Devuelve un error si el miembro no tiene stats
        if (!client.db.stats[member.id]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${member} no tiene puntos de XP`)
        ]});
        
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
        let nextRewardedRoles;

        //Por cada recompensa
        for (let index = 0; index < sortedRewards.length; index++) {

            //Si el nivel requerido es mayor o igual al siguiente nivel del miembro
            if (sortedRewards[index].requiredLevel >= (memberStats.level + 1)) {

                //Almacena los roles de la próxima recompensa
                nextRewardedRoles = sortedRewards[index].roles;

                //Para el bucle
                break;
            };
        };

        //Almacena la próxima recompensa por defecto
        let nextRewards = 'Ninguna';

        //Si se encontró una próxima recompensa
        if (nextRewardedRoles) {

            //Almacena los nombres de los roles de la recompensa
            let roleNames = []; 

            //Crea una promesa para que se resuelva cuando haya acabado de buscar los nombres de todos los roles
            const getRewards = new Promise((resolve, reject) => {

                //Para cada ID de rol, busca su nombre
                nextRewardedRoles.forEach(async (value, index, array) => {

                    //Busca y almacena el rol
                    const role = await message.guild.roles.fetch(value);

                    //Sube al array de nombres, el nombre del rol iterado
                    roleNames.push(role.name);

                    //Se resuelve la promesa si todos los roles se han encontrado
                    if (index === array.length -1) resolve();
                });
            });
            
            //Invoca la promesa para obtener los nombres de los roles
            await getRewards.then(() => {

                //Sobreescribe la variable "nextRewards" con los resultados obtenidos
                nextRewards = roleNames.join(', ');
            });
        };

        //Envía el mensaje con las estadísticas
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setTitle('🥇 Estadísticas')
            .setDescription(`Mostrando las estadísticas del miembro **${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField('Nivel actual', `\`${memberStats.level}\``, true)
            .addField('XP Total', `\`${memberStats.totalXP}\``, true)
            .addField('XP para el siguiente nivel', nonXP ? '\`No puede subir de nivel\`' : `\`${xpToNextLevel - memberStats.totalXP}\``, true)
            .addField('Siguiente recompensa', nonXP ? '\`No puede ganar recompensas\`' : `\`${nextRewards}\``, true)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'stats',
    aliases: ['rank']
};

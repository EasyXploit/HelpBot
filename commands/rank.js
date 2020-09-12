exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //!rank (@usuario)
    
    try {
        let notFoundEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`);

        const member = await resources.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send(notFoundEmbed);

        if (message.guild.id in client.stats === false) {
            client.stats[message.guild.id] = {};
        };

        const guildStats = client.stats[message.guild.id];

        if (member.id in guildStats === false) {
            guildStats[member.id] = {
                totalXP: 0,
                actualXP: 0,
                level: 0,
                last_message: 0
            };
        };
        
        const userStats = guildStats[member.id];
        const xpToNextLevel = 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100;

        let nonXP;
        for (let i = 0; i < config.nonXPRoles.length; i++) {
            if (await member.roles.cache.find(r => r.id === config.nonXPRoles[i])) {
                nonXP = true;
                break;
            };
        };

        let resultEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setTitle(`🥇 Rango`)
            .setDescription(`Mostrando el rango del usuario **${member.user.tag}**`)
            .setThumbnail(member.user.displayAvatarURL())
            .addField(`Nivel actual`, userStats.level, true)
            .addField(`XP Total`, userStats.totalXP, true)
            
            //Mostrar next reward

        if (nonXP) {
            resultEmbed.addField(`XP para el siguiente nivel`, '\`No puedes subir de nivel\`', true);
        } else {
            resultEmbed.addField(`XP para el siguiente nivel`, xpToNextLevel - userStats.actualXP, true);
        };
        
        message.channel.send(resultEmbed);

    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};

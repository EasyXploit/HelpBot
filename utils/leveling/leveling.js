async function leveling(discord, fs, bot, config, resources, message) {
    
    const random = require('random');

    if (message.guild.id in bot.stats === false) {
        bot.stats[message.guild.id] = {};
    };

    const guildStats = bot.stats[message.guild.id];

    let nonXP;
    for (let i = 0; i < config.nonXPRoles.length; i++) {
        if (await message.member.roles.cache.find(r => r.id === config.nonXPRoles[i])) {
            nonXP = true;
            break;
        };
    };
    if (nonXP || config.nonXPChannels.includes(message.channel.id)) return;

    if (message.author.id in guildStats === false) {
        guildStats[message.author.id] = {
            totalXP: 0,
            actualXP: 0,
            level: 0,
            last_message: 0
        };
    };

    const userStats = guildStats[message.author.id];

    if (Date.now() - userStats.last_message > 5000) {
        const newXp = random.int(5, 15);
        userStats.actualXP += newXp;
        userStats.totalXP += newXp;
        userStats.last_message = Date.now();

        const xpToNextLevel = 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100;
        if (userStats.actualXP >= xpToNextLevel) {
            userStats.level++;
            userStats.actualXP = userStats.actualXP - xpToNextLevel;

            const rewards = require('./rewards.json');

            for (let i = rewards.length - 1; i >= 0; i--) {
                let reward = rewards[i];
    
                if (userStats.level >= reward.requiredLevel) {
                    if (userStats.level > 1) {
                        let pastReward = rewards[i - 1];
                        pastReward.roles.forEach(async role => {
                            if (message.member.roles.cache.has(role)) await message.member.roles.remove(role);
                        });
                    };
    
                    reward.roles.forEach(async role => {
                        if (!message.member.roles.cache.has(role)) await message.member.roles.add(role);
                    });
                    break;
                };
            };

            let levelUpEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setAuthor(`¡Subiste de nivel!`, message.author.displayAvatarURL())
                .setDescription(`Enhorabuena <@${message.author.id}>, has subido al nivel **${userStats.level}**`);

            message.channel.send(levelUpEmbed);
        };

        fs.writeFile(`./storage/stats.json`, JSON.stringify(bot.stats, null, 4), async err => {
            if (err) throw err;
        });
    };
};

module.exports = leveling;


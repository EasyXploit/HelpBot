exports.run = (discord, bot, fs, resources, moment, config) => {

    const debuggingChannel = bot.channels.cache.get(config.debuggingChannel);
    const loggingChannel = bot.channels.cache.get(config.loggingChannel);

    //Comprobación de usuarios silenciados temporalmente
    bot.setInterval(async () => {
        for (let idKey in bot.mutes) {
            let time = bot.mutes[idKey].time;

            if (Date.now() > time) {

                let guild = bot.guilds.cache.get(resources.server.id);
            
                let role = guild.roles.cache.find(r => r.name === `Silenciado`)
                if (!role) continue;

                let member;

                try {
                    member = await guild.members.cache.get(idKey);
                } catch (e) {
                    console.log(e);
                    delete bot.mutes[idKey];
                    fs.writeFile(`storage/mutes.json`, JSON.stringify(bot.mutes), async err => {
                        if (err) throw err;

                        let loggingEmbed = new discord.MessageEmbed()
                            .setColor(resources.green)
                            .setAuthor(`@${bot.mutes[idKey].tag} ha sido DES-SILENCIADO, pero no se encontraba en el servidor`)
                            .addField(`ID`, idKey, true)
                            .addField(`Moderador`, `<@${bot.user.id}>`, true)
                            .addField(`Razón`, `Venció la amonestación`, true);

                        await loggingChannel.send(loggingEmbed);
                    });
                    return;
                }

                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL())
                    .addField(`Miembro`, `<@${member.id}>`, true)
                    .addField(`Moderador`, `<@${bot.user.id}>`, true)
                    .addField(`Razón`, `Venció la amonestación`, true);

                let toDMEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setAuthor(`[DES-SILENCIADO]`, guild.iconURL())
                    .setDescription(`<@${member.id}>, has sido des-silenciado en ${guild.name}`)
                    .addField(`Moderador`, bot.user.id, true)
                    .addField(`Razón`, `Venció la amonestación`, true);

                await member.roles.remove(role);

                delete bot.mutes[idKey];
                fs.writeFile(`./storage/mutes.json`, JSON.stringify(bot.mutes), async err => {
                    if (err) throw err;

                    await loggingChannel.send(loggingEmbed);
                    await member.send(toDMEmbed);
                });
            }
        }
    }, 5000)

    //Comprobación de usuarios baneados temporalmente
    bot.setInterval(async () => {
        for (let idKey in bot.bans) {
            let time = bot.bans[idKey].time;
            let guild = bot.guilds.cache.get(resources.server.id);
            let user = await bot.users.fetch(idKey);

            if (Date.now() > time) {
                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setAuthor(`${user.tag} ha sido DES-BANEADO`, user.displayAvatarURL())
                    .addField(`Usuario`, `@${user.tag}`, true)
                    .addField(`Moderador`, `<@${bot.user.id}>`, true)
                    .addField(`Razón`, `Venció la amonestación`, true);

                await guild.members.unban(idKey);

                delete bot.bans[idKey];
                fs.writeFile(`./storage/bans.json`, JSON.stringify(bot.bans), async err => {
                    if (err) throw err;

                    await loggingChannel.send(loggingEmbed);
                });
            }
        }
    }, 5000)

    //Comprobación del tiempo de respuesta del Websocket
    bot.setInterval(async () => {
        let ping = Math.round(bot.ping);
        if (ping > 1000) {
            console.log(`${new Date().toLocaleString()} 》Tiempo de respuesta del Websocket elevado: ${ping} ms\n`);

            let debuggingEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL())
                .setDescription(`${resources.OrangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${ping}** ms`);
            debuggingChannel.send(debuggingEmbed);
        }
    }, 60000)

    //Comprobación del encuestas expiradas
    bot.setInterval(async () => {
        for (let idKey in bot.polls) {
            let duration = bot.polls[idKey].duration;

            let channel = await bot.channels.fetch(bot.polls[idKey].channel);
            if (!channel) {
                delete bot.polls[idKey];
                return fs.writeFile(`./storage/polls.json`, JSON.stringify(bot.polls), async err => {
                    if (err) throw err;
                });
            };

            let poll = await channel.messages.fetch(idKey);
            if (!poll) {
                delete bot.polls[idKey];
                return fs.writeFile(`./storage/polls.json`, JSON.stringify(bot.polls), async err => {
                    if (err) throw err;
                });
            };

            if (Date.now() > duration) {
                let reactions = poll.reactions.cache;
                let votes = [];
                let totalVotes = 0;
                reactions.forEach(reaction => {
                    votes.push({
                        emoji: reaction._emoji.name,
                        count: reaction.count - 1
                    });
                    totalVotes = totalVotes + (reaction.count - 1);
                });

                let results = [];
                for (let i = 0; i < votes.length; i++) {
                    let count = votes[i].count;
                    let percentage = (count / totalVotes) * 100;
                    let roundedPercentage = Math.round((percentage + Number.EPSILON) * 100) / 100;
                    if(isNaN(roundedPercentage)) roundedPercentage = 0;
                    results.push(`🞄 ${votes[i].emoji} ${count} votos, el ${roundedPercentage}%`);
                };

                let resultEmbed = new discord.MessageEmbed()
                    .setAuthor('Encuesta finalizada', 'https://i.imgur.com/KP30svJ.png')
                    .setDescription(`**${bot.polls[idKey].title}**\n\n${bot.polls[idKey].options}`)
                    .addField('Resultados', results.join(' '));

                await poll.reactions.removeAll();
                await poll.edit(resultEmbed);

                delete bot.polls[idKey];
                fs.writeFile(`./storage/polls.json`, JSON.stringify(bot.polls), async err => {
                    if (err) throw err;
                });
            } else {
                let remainingTime = bot.polls[idKey].duration - Date.now();
                let remainingDays = Math.floor(remainingTime / (60*60*24*1000));

                let oldRemainingTime = poll.footer;
                let newRemainingTime = `Restante: ${remainingDays}d ${moment().startOf('day').milliseconds(remainingTime).format('HH:mm')}`;

                let updatedPoll = new discord.MessageEmbed()
                    .setColor(0x2AB7F1)
                    .setAuthor('Encuesta disponible', 'https://i.imgur.com/zdAm4AD.png')
                    .setDescription(`**${bot.polls[idKey].title}**\n\n${bot.polls[idKey].options}`)
                    .setFooter(newRemainingTime);

                if (oldRemainingTime !== newRemainingTime) poll.edit(updatedPoll);
            };
        };
    }, 5000);

    //Actualización de usuarios totales en presencia
    bot.setInterval(async () => {
        await bot.user.setPresence({
            activity: {
                name: `${bot.users.cache.filter(user => !user.bot).size} usuarios | ${config.game}`,
                type: config.type
            }
        });
    }, 60000);
};

exports.run = (discord, client, fs, resources, moment, config) => {

    const debuggingChannel = client.channels.cache.get(config.debuggingChannel);
    const loggingChannel = client.channels.cache.get(config.loggingChannel);

    //Comprobación de usuarios silenciados temporalmente
    client.setInterval(async () => {
        for (let idKey in client.mutes) {
            let time = client.mutes[idKey].time;

            if (Date.now() > time) {

                let guild = client.guilds.cache.get(resources.server.id);
            
                let role = guild.roles.cache.find(r => r.name === `Silenciado`)
                if (!role) continue;

                const member = await resources.fetchMember(message.guild, args[1]);
                if (!member) {
                    await delete client.mutes[idKey];
                    fs.writeFile(`storage/mutes.json`, JSON.stringify(client.mutes), async err => {
                        if (err) throw err;

                        let loggingEmbed = new discord.MessageEmbed()
                            .setColor(resources.green)
                            .setAuthor(`${client.mutes[idKey].tag} ha sido DES-SILENCIADO, pero no se encontraba en el servidor`)
                            .addField(`ID`, idKey, true)
                            .addField(`Moderador`, `<@${client.user.id}>`, true)
                            .addField(`Razón`, `Venció la amonestación`, true);

                        return await loggingChannel.send(loggingEmbed);
                    });
                };

                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL())
                    .addField(`Miembro`, member.user.tag, true)
                    .addField(`Moderador`, `<@${client.user.id}>`, true)
                    .addField(`Razón`, `Venció la amonestación`, true);

                let toDMEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setAuthor(`[DES-SILENCIADO]`, guild.iconURL())
                    .setDescription(`${member.user.tag}, has sido des-silenciado en ${guild.name}`)
                    .addField(`Moderador`, client.user.id, true)
                    .addField(`Razón`, `Venció la amonestación`, true);

                await member.roles.remove(role);

                delete client.mutes[idKey];
                fs.writeFile(`./storage/mutes.json`, JSON.stringify(client.mutes), async err => {
                    if (err) throw err;

                    await loggingChannel.send(loggingEmbed);
                    await member.send(toDMEmbed);
                });
            }
        }
    }, 5000)

    //Comprobación de usuarios baneados temporalmente
    client.setInterval(async () => {
        for (let idKey in client.bans) {
            let time = client.bans[idKey].time;
            let guild = client.guilds.cache.get(resources.server.id);
            let user = await client.users.fetch(idKey);

            if (Date.now() > time) {
                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.green)
                    .setAuthor(`${user.tag} ha sido DES-BANEADO`, user.displayAvatarURL())
                    .addField(`Usuario`, user.tag, true)
                    .addField(`Moderador`, `<@${client.user.id}>`, true)
                    .addField(`Razón`, `Venció la amonestación`, true);

                await guild.members.unban(idKey);

                delete client.bans[idKey];
                fs.writeFile(`./storage/bans.json`, JSON.stringify(client.bans), async err => {
                    if (err) throw err;

                    await loggingChannel.send(loggingEmbed);
                });
            }
        }
    }, 5000)

    //Comprobación del tiempo de respuesta del Websocket
    client.setInterval(async () => {
        let ping = Math.round(client.ping);
        if (ping > 1000) {
            console.log(`${new Date().toLocaleString()} 》Tiempo de respuesta del Websocket elevado: ${ping} ms\n`);

            let debuggingEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setFooter(client.user.username, client.user.avatarURL())
                .setDescription(`${resources.OrangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${ping}** ms`);
            debuggingChannel.send(debuggingEmbed);
        }
    }, 60000)

    //Comprobación de encuestas expiradas
    client.setInterval(async () => {
        for (let idKey in client.polls) {
            let channel;
            let duration = client.polls[idKey].duration;

            try {
                channel = await client.channels.fetch(client.polls[idKey].channel);
            } catch (e) {
                delete client.polls[idKey];
                return fs.writeFile(`./storage/polls.json`, JSON.stringify(client.polls), async err => {
                    if (err) throw err;
                });
            };

            let poll = await channel.messages.fetch(idKey);
            if (!poll) {
                delete client.polls[idKey];
                return fs.writeFile(`./storage/polls.json`, JSON.stringify(client.polls), async err => {
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
                    .setDescription(`**${client.polls[idKey].title}**\n\n${client.polls[idKey].options}`)
                    .addField('Resultados', results.join(' '));

                await poll.reactions.removeAll();
                await poll.edit(resultEmbed).then(async poll => {

                    let loggingEmbed = new discord.MessageEmbed()
                        .setColor(resources.blue)
                        .setTitle('📑 Auditoría - [ENCUESTAS]')
                        .setDescription(`La encuesta "__[${client.polls[idKey].title}](${poll.url})__" ha finalizado en el canal <#${client.polls[idKey].channel}>.`);

                    await loggingChannel.send(loggingEmbed)

                });

                delete client.polls[idKey];
                fs.writeFile(`./storage/polls.json`, JSON.stringify(client.polls), async err => {
                    if (err) throw err;
                });
            } else {
                let remainingTime = client.polls[idKey].duration - Date.now();
                let remainingDays = Math.floor(remainingTime / (60*60*24*1000));
                let remainingHours = Math.floor((remainingTime - (remainingDays * 86400000)) / (60*60*1000));
                let remainingMinutes = Math.floor((remainingTime - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60*1000));

                let oldRemainingTime = poll.footer;
                let newRemainingTime = `Restante: ${remainingDays}d ${remainingHours}h ${remainingMinutes}m `;

                let updatedPoll = new discord.MessageEmbed()
                    .setColor(0x2AB7F1)
                    .setAuthor('Encuesta disponible', 'https://i.imgur.com/zdAm4AD.png')
                    .setDescription(`**${client.polls[idKey].title}**\n\n${client.polls[idKey].options}`)
                    .setFooter(newRemainingTime);

                if (oldRemainingTime !== newRemainingTime) await poll.edit(updatedPoll);
            };
        };
    }, 5000);

    //Comprobación de minutos de voz
    client.setInterval(async () => {
        for (let idKey in client.usersVoiceStates) {

            //Almacena el estado de voz actual del miembro, y su guild
            const voiceState = client.usersVoiceStates[idKey];
            const guild = client.guilds.cache.get(voiceState.guild);

            //Almacena el miembro y comprueba si está silenciado o ensordecido
            const member = await resources.fetchMember(guild, idKey);
            if (!member || member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(m => !m.user.bot).size === 1) return;

            //Llama al manejador de leveling
            await resources.addXP(fs, config, member, guild, 'voice');

            //Actualiza el timestamp de la última recompensa de XP
            client.usersVoiceStates[member.id].last_xpReward = Date.now();
        };
    }, config.XPVoiceMinutes);

    //Actualización de usuarios totales en presencia
    client.setInterval(async () => {
        await client.user.setPresence({
            activity: {
                name: `${client.users.cache.filter(user => !user.bot).size} usuarios | ${config.game}`,
                type: config.type
            }
        });
    }, 60000);

    //Presencia
    client.setInterval(async () => {
        let usersCount = client.homeGuild.members.cache.filter(member => !member.user.bot).size;

        await client.user.setPresence({
            status: config.status,
            activity: {
                name: `${usersCount} usuarios | ${config.game}`,
                type: config.type
            }
        });
    }, 60000);
};

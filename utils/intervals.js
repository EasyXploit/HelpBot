exports.run = (discord, client) => {

    //Comprobación de miembros silenciados temporalmente
    client.setInterval(async () => {
        for (let idKey in client.mutes) {
            let time = client.mutes[idKey].time;

            if (Date.now() > time) {

                let guild = client.guilds.cache.get(client.homeGuild.id);
            
                let role = guild.roles.cache.find(r => r.name === '🔇 SILENCIADO')
                if (!role) continue;

                const member = await client.functions.fetchMember(guild, idKey);
                if (!member) {
                    delete client.mutes[idKey];
                    client.fs.writeFile('databases/mutes.json', JSON.stringify(client.mutes, null, 4), async err => {
                        if (err) throw err;

                        let loggingEmbed = new discord.MessageEmbed()
                            .setColor(client.config.colors.correct)
                            .setAuthor('Un usuario ha sido DES-SILENCIADO, pero no se encontraba en el servidor')
                            .addField('ID', idKey, true)
                            .addField('Moderador', `<@${client.user.id}>`, true)
                            .addField('Razón', 'Venció la amonestación', true);

                        await client.functions.loggingManager(loggingEmbed);
                    });
                    return;
                };

                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL({dynamic: true}))
                    .addField('Miembro', member.user.tag, true)
                    .addField('Moderador', `<@${client.user.id}>`, true)
                    .addField('Razón', 'Venció la amonestación', true);

                let toDMEmbed = new discord.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor('[DES-SILENCIADO]', guild.iconURL({dynamic: true}))
                    .setDescription(`${member.user.tag}, has sido des-silenciado en ${guild.name}`)
                    .addField('Moderador', `<@${client.user.id}>`, true)
                    .addField('Razón', 'Venció la amonestación', true);

                await member.roles.remove(role);

                delete client.mutes[idKey];
                client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.mutes, null, 4), async err => {
                    if (err) throw err;

                    await client.functions.loggingManager(loggingEmbed);
                    await member.send(toDMEmbed);
                });
            };
        };
    }, 5000);

    //Comprobación de miembros baneados temporalmente
    client.setInterval(async () => {
        for (let idKey in client.bans) {
            let time = client.bans[idKey].time;
            let guild = client.guilds.cache.get(client.homeGuild.id);
            let user = await client.users.fetch(idKey);

            if (Date.now() > time) {

                let loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor(`${user.tag} ha sido DES-BANEADO`, user.displayAvatarURL({dynamic: true}))
                    .addField('Usuario', user.tag, true)
                    .addField('Moderador', `<@${client.user.id}>`, true)
                    .addField('Razón', 'Venció la amonestación', true);

                delete client.bans[idKey];
                client.fs.writeFile('./databases/bans.json', JSON.stringify(client.bans, null, 4), async err => {
                    if (err) throw err;

                    try {
                        await guild.members.unban(idKey);
                        await client.functions.loggingManager(loggingEmbed);
                    } catch (error) {
                        if (error.toString().includes('Unknown Ban')) return;
                    };
                });
            };
        };
    }, 5000);

    //Comprobación del tiempo de respuesta del Websocket
    client.setInterval(async () => {
        let ping = Math.round(client.ping);
        if (ping > 1000) {
            console.log(`${new Date().toLocaleString()} 》Tiempo de respuesta del Websocket elevado: ${ping} ms\n`);

            let debuggingEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setFooter(client.user.username, client.user.avatarURL())
                .setDescription(`${client.customEmojis.orangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${ping}** ms`);

            if (client.debuggingChannel) client.debuggingChannel.send(debuggingEmbed);
        };
    }, 60000);

    //Comprobación de encuestas expiradas
    client.setInterval(async () => {
        for (let idKey in client.polls) {
            let channel, poll;
            let duration = client.polls[idKey].duration;

            try {
                channel = await client.channels.fetch(client.polls[idKey].channel);
                poll = await channel.messages.fetch(idKey);
            } catch (error) {
                delete client.polls[idKey];
                return client.fs.writeFile('./databases/polls.json', JSON.stringify(client.polls, null, 4), async err => {
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
                    .attachFiles(new discord.MessageAttachment('./resources/images/endFlag.png', 'endFlag.png'))
                    .setAuthor('Encuesta finalizada', 'attachment://endFlag.png')
                    .setDescription(`**${client.polls[idKey].title}**\n\n${client.polls[idKey].options}`)
                    .addField('Resultados', results.join(' '));

                await poll.channel.send(resultEmbed).then(async poll => {

                    let loggingEmbed = new discord.MessageEmbed()
                        .setColor(client.config.colors.logging)
                        .setTitle('📑 Auditoría - [ENCUESTAS]')
                        .setDescription(`La encuesta "__[${client.polls[idKey].title}](${poll.url})__" ha finalizado en el canal <#${client.polls[idKey].channel}>.`);

                    await client.loggingChannel.send(loggingEmbed)

                });
                
                await poll.delete();

                delete client.polls[idKey];
                client.fs.writeFile('./databases/polls.json', JSON.stringify(client.polls, null, 4), async err => {
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
                    .setColor('2AB7F1')
                    .attachFiles(new discord.MessageAttachment('./resources/images/poll.png', 'poll.png'))
                    .setAuthor('Encuesta disponible', 'attachment://poll.png')
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
            const member = await client.functions.fetchMember(guild, idKey);
            if (!member || member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(m => !m.user.bot).size === 1) return;

            //Llama al manejador de leveling
            await client.functions.addXP(member, guild, 'voice');

            //Actualiza el timestamp de la última recompensa de XP
            client.usersVoiceStates[member.id].last_xpReward = Date.now();
        };
    }, client.config.xp.XPGainInterval);

    //Actualización de miembros totales en presencia
    client.setInterval(async () => {
        if (!client.config.presence.membersCount) return;
        const name = `${await client.homeGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size)} miembros | ${client.config.presence.name}`;

        await client.user.setPresence({
            status: client.config.presence.status,
            activities: [{
                name: name,
                type: client.config.presence.type
            }]
        })
    }, 60000);

    console.log(' - [OK] Carga de intervalos.');
};

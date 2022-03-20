exports.run = (client) => {

    //Comprobación de miembros silenciados temporalmente
    setInterval(async () => {
        for (let idKey in client.db.mutes) {
            let time = client.db.mutes[idKey].time;

            if (Date.now() > time) {

                let guild = client.guilds.cache.get(client.homeGuild.id);
            
                let role = guild.roles.cache.find(r => r.id === client.config.dynamic.mutedRoleId)
                if (!role) continue;

                const member = await client.functions.fetchMember(guild, idKey);
                if (!member) {
                    delete client.db.mutes[idKey];
                    client.fs.writeFile('databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {
                        if (err) throw err;

                        let loggingEmbed = new client.MessageEmbed()
                            .setColor(client.config.colors.correct)
                            .setAuthor({ name: 'Un usuario ha sido DES-SILENCIADO, pero no se encontraba en el servidor' })
                            .addField('ID', idKey, true)
                            .addField('Moderador', `<@${client.user.id}>`, true)
                            .addField('Razón', 'Venció la amonestación', true);

                        await client.functions.loggingManager('embed', loggingEmbed);
                    });
                    return;
                };

                let loggingEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: `${member.user.tag} ha sido DES-SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addField('Miembro', member.user.tag, true)
                    .addField('Moderador', `<@${client.user.id}>`, true)
                    .addField('Razón', 'Venció la amonestación', true);

                let toDMEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: '[DES-SILENCIADO]', iconURL: guild.iconURL({dynamic: true}) })
                    .setDescription(`${member.user.tag}, has sido des-silenciado en ${guild.name}`)
                    .addField('Moderador', `<@${client.user.id}>`, true)
                    .addField('Razón', 'Venció la amonestación', true);

                await member.roles.remove(role);

                delete client.db.mutes[idKey];
                client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {
                    if (err) throw err;

                    await client.functions.loggingManager('embed', loggingEmbed);
                    await member.send({ embeds: [toDMEmbed] });
                });
            };
        };
    }, 5000);

    //Comprobación de miembros baneados temporalmente
    setInterval(async () => {
        for (let idKey in client.db.bans) {
            let time = client.db.bans[idKey].time;
            let guild = client.guilds.cache.get(client.homeGuild.id);
            let user = await client.users.fetch(idKey);

            if (Date.now() > time) {

                let loggingEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: `${user.tag} ha sido DES-BANEADO`, iconURL: user.displayAvatarURL({dynamic: true}) })
                    .addField('Usuario', user.tag, true)
                    .addField('Moderador', `<@${client.user.id}>`, true)
                    .addField('Razón', 'Venció la amonestación', true);

                delete client.db.bans[idKey];
                client.fs.writeFile('./databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {
                    if (err) throw err;

                    try {
                        await guild.members.unban(idKey);
                        await client.functions.loggingManager('embed', loggingEmbed);
                    } catch (error) {
                        if (error.toString().includes('Unknown Ban')) return;
                    };
                });
            };
        };
    }, 5000);

    //Comprobación del tiempo de respuesta del Websocket
    setInterval(async () => {
        let ping = Math.round(client.ping);
        if (ping > 1000) {
            console.warn(`${new Date().toLocaleString()} 》AVISO: Tiempo de respuesta del Websocket elevado: ${ping} ms\n`);

            let debuggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })
                .setDescription(`${client.customEmojis.orangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${ping}** ms`);

                client.functions.debuggingManager('embed', debuggingEmbed);
        };
    }, 60000);

    //Comprobación de encuestas expiradas
    setInterval(async () => {
        for (let idKey in client.db.polls) {
            let channel, poll;
            let duration = client.db.polls[idKey].duration;

            try {
                channel = await client.functions.fetchChannel(client.homeGuild, client.db.polls[idKey].channel);
                poll = await channel.messages.fetch(idKey);
            } catch (error) {
                delete client.db.polls[idKey];
                return client.fs.writeFile('./databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {
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

                let resultEmbed = new client.MessageEmbed()
                    .setAuthor({ name: 'Encuesta finalizada', iconURL: 'attachment://endFlag.png' })
                    .setDescription(`**${client.db.polls[idKey].title}**\n\n${client.db.polls[idKey].options}`)
                    .addField('Resultados', results.join(' '));

                await poll.channel.send({ embeds: [resultEmbed], files: ['./resources/images/endFlag.png'] }).then(async poll => {

                    let loggingEmbed = new client.MessageEmbed()
                        .setColor(client.config.colors.logging)
                        .setTitle('📑 Auditoría - [ENCUESTAS]')
                        .setDescription(`La encuesta "__[${client.db.polls[idKey].title}](${poll.url})__" ha finalizado en el canal <#${client.db.polls[idKey].channel}>.`);

                    await client.functions.loggingManager('embed', { embeds: [loggingEmbed] });

                });
                
                await poll.delete();

                delete client.db.polls[idKey];
                client.fs.writeFile('./databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {
                    if (err) throw err;
                });
            } else {
                let remainingTime = client.db.polls[idKey].duration - Date.now();
                let remainingDays = Math.floor(remainingTime / (60*60*24*1000));
                let remainingHours = Math.floor((remainingTime - (remainingDays * 86400000)) / (60*60*1000));
                let remainingMinutes = Math.floor((remainingTime - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60*1000));

                let oldRemainingTime = poll.footer;
                let newRemainingTime = `Restante: ${remainingDays}d ${remainingHours}h ${remainingMinutes}m `;

                let updatedPoll = new client.MessageEmbed()
                    .setColor('2AB7F1')
                    .setAuthor({ name: 'Encuesta disponible', iconURL: 'attachment://poll.png' })
                    .setDescription(`**${client.db.polls[idKey].title}**\n\n${client.db.polls[idKey].options}`)
                    .setFooter({ text: newRemainingTime });

                if (oldRemainingTime !== newRemainingTime) await poll.edit({ embeds: [updatedPoll], files: ['./resources/images/poll.png'] });
            };
        };
    }, 5000);

    //Comprobación de minutos de voz
    setInterval(async () => {
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
    setInterval(async () => {
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

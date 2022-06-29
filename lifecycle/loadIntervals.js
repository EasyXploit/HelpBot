exports.run = (client) => {

    //Traducciones de los intervalos
    const locale = client.locale.lifecycle.loadIntervals;

    //SILENCIADOS
    //Comprobación de miembros silenciados temporalmente
    setInterval(async () => {

        //Busca el rol silenciado (o lo crea si es necesario)
        const role = await client.functions.utilities.fetch.run(client, 'role', client.config.dynamic.mutedRoleId) || await client.functions.moderation.checkMutedRole.run(client, client.homeGuild);
        
        //Para cada uno de los silencios temporales de la BD
        for (let idKey in client.db.mutes) {

            //Almacena el tiempo de finalización del silenciamiento
            const endTime = client.db.mutes[idKey].until;

            //Omite si la sanción es indefinida
            if (!endTime) continue; 

            //Omite si aún no ha expirado la sanción
            if (Date.now() < endTime) continue;
            
            //Busca el miembro
            const member = await client.functions.utilities.fetch.run(client, 'member', idKey);

            //Si el miembro estaba en la guild (y tenía el rol), se lo elimina
            if (member && member.roles.cache.has(role.id)) await member.roles.remove(role);

            //Bora el silenciamiento de la base de datos
            delete client.db.mutes[idKey];

            //Graba la nueva base de datos
            client.fs.writeFile('./storage/databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

                //Si hubo un error, lo devuelve
                if (err) throw err;

                //Almacena el autor del embed para el logging
                let authorProperty = { name: await client.functions.utilities.parseLocale.run(locale.mutes.loggingEmbed.author, { memberTag: member ? member.user.tag : idKey }) }
                if (member) authorProperty.iconURL = member.user.displayAvatarURL({dynamic: true});
                
                //Ejecuta el manejador de registro
                if (client.config.logging.unmutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor(authorProperty)
                    .addField(locale.mutes.loggingEmbed.member, member ? member.user.tag : `\`${idKey}\``, true)
                    .addField(locale.mutes.loggingEmbed.moderator, `${client.user}`, true)
                    .addField(locale.mutes.loggingEmbed.reason, locale.mutes.reason, true)
                );
                
                //Envía una confirmación al miembro
                if (member) await member.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: locale.mutes.privateEmbed.author, iconURL: client.homeGuild.iconURL({dynamic: true}) })
                    .setDescription(await client.functions.utilities.parseLocale.run(locale.mutes.privateEmbed.description, { memberTag: member ? member.user.tag : `\`${idKey}\``, guildName: client.homeGuild.name }))
                    .addField(locale.mutes.privateEmbed.moderator, `${client.user}`, true)
                    .addField(locale.mutes.privateEmbed.reason, locale.mutes.reason, true)
                ]});
            });
        };
    }, 5000);

    //BANEOS
    //Comprobación de miembros baneados temporalmente
    setInterval(async () => {

        //Para cada uno de los baneos temporales de la BD
        for (let idKey in client.db.bans) {

            //Almacena el tiempo de finalización
            const endTime = client.db.bans[idKey].until;

            //Omite si aún no se ha de desbanear
            if (Date.now() < endTime) continue;

            //Busca el usuario de Discord
            const user = await client.users.fetch(idKey);

            //Elimina la entrada del baneo en la BD
            delete client.db.bans[idKey];

            //Vuelve a grabar la base de datos
            client.fs.writeFile('./storage/databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

                //Si se genera un error, lo lanza
                if (err) throw err;

                try {

                    //Desbanea al usuario (si existe)
                    if (user) await client.homeGuild.members.unban(idKey);

                    //Ejecuta el manejador de registro
                    if (client.config.logging.unbannedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                        .setColor(client.config.colors.correct)
                        .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.bans.loggingEmbed.author, { userTag: user.tag }), iconURL: user.displayAvatarURL({dynamic: true}) })
                        .addField(locale.bans.loggingEmbed.user, user.tag, true)
                        .addField(locale.bans.loggingEmbed.moderator, `${client.user}`, true)
                        .addField(locale.bans.loggingEmbed.reason, locale.bans.reason, true)
                    );

                } catch (error) {

                    //Omite el error si el ban se eliminó manualmente
                    if (error.toString().includes('Unknown Ban')) return;

                    //Envía un mensaje de error a la consola
                    console.error(`${new Date().toLocaleString()} 》${locale.bans.error}: `, error.stack);
                };
            });
        };
    }, 5000);

    //PING
    //Comprobación del tiempo de respuesta del Websocket
    setInterval(async () => {

        //Almacena el ping actual
        const actualPing = Math.round(client.ping);

        //Si el ping desciende del umbral establecido
        if (actualPing > client.config.main.pingTreshold) {

            //Envía una advertencia a la consola
            console.warn(`${new Date().toLocaleString()} 》${locale.ping.consoleMsg}: ${actualPing} ms\n`);

            //Ejecuta el manejador de depuración
            await client.functions.managers.debugging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${locale.ping.debuggingMsg}: **${actualPing}** ms`)
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })
            );
        };
    }, 60000);

    //NOMBRES DE USUARIO
    //Comprobación de nombres de usuario de miembros
    if (client.config.moderation.kickOnBadUsername) setInterval(async () => {

        //Por cada uno de los miembros de la guild
        await client.homeGuild.members.cache.forEach(async guildMember => {

            //Comprueba si el nombre de usuario (visible) del miembro es válido
            await client.functions.moderation.checkUsername.run(client, guildMember);
        });

    }, 120000);

    //ENCUESTAS
    //Comprobación de encuestas expiradas
    setInterval(async () => {

        //Para cada una de las encuestas en la BD
        for (let idKey in client.db.polls) {

            //Almacena la info. de la encuesta
            const storedPoll = client.db.polls[idKey];

            //Omite esta encuesta si no tiene expiración
            if (!storedPoll.expiration) continue;

            //Busca el canal de la encuesta
            const channel = await client.functions.utilities.fetch.run(client, 'channel', storedPoll.channel);

            //Busca el mensaje de la encuesta
            const poll = await client.functions.utilities.fetch.run(client, 'message', storedPoll.message, channel);

            //Si no se encontró el canal o la encuesta
            if (!channel || !poll) {

                //Elimina la encuesta de la BD
                delete client.db.polls[idKey];

                //Actualiza el fichero de la BD
                return client.fs.writeFile('./storage/databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {

                    //Si encuentra un error, lo lanza por consola
                    if (err) throw err;
                });
            };

            //Si la encuesta ya ha expirado
            if (Date.now() > storedPoll.expiration) {

                //Almacena los votos realizados
                let votes = [];

                //Almacena el número total de votos
                let totalVotes = 0;

                //Por cada una de las reacciones de la encuesta
                poll.reactions.cache.forEach(reaction => {

                    //Añade los votos de la reacción al array de votos
                    votes.push({
                        emoji: reaction._emoji.name,
                        count: reaction.count - 1
                    });

                    //Añade el número total de votos (sin contar el del bot)
                    totalVotes += reaction.count - 1;
                });

                //Almacena los resultados de la encuesta
                let results = [];

                //Para cada uno de los votos de la encuesta
                for (let index = 0; index < votes.length; index++) {

                    //Almacena la cantidad de votos de la opción
                    const count = votes[index].count;

                    //Almacena el porcentaje de votos de la opción con respecto a las demás
                    const percentage = (count / totalVotes) * 100;

                    //Redonde el porcentaje
                    let roundedPercentage = Math.round((percentage + Number.EPSILON) * 100) / 100;

                    //Si no es un valor válido, lo cambia a 0
                    if(isNaN(roundedPercentage)) roundedPercentage = 0;

                    //Añade la cadena del resultado al array de resultados
                    results.push(`🞄 ${votes[index].emoji} ${await client.functions.utilities.parseLocale.run(locale.polls.votesPercentage, { votesCount: count, percentage: roundedPercentage })}`);
                };

                //Envía los resultados al canal de la encuesta
                await poll.channel.send({ embeds: [ new client.MessageEmbed()
                    .setAuthor({ name: locale.polls.finishedEmbed.author, iconURL: 'attachment://endFlag.png' })
                    .setDescription(`${storedPoll.title}\n\n${storedPoll.options}`)
                    .addField(locale.polls.finishedEmbed.results, results.join(' '))
                ], files: ['./resources/images/endFlag.png']}).then(async poll => {

                    //Envía una notificación al canal de registro
                    if (client.config.logging.pollEnded) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                        .setColor(client.config.colors.logging)
                        .setTitle(`📑 ${locale.polls.loggingEmbed.title}`)
                        .setDescription(`${await client.functions.utilities.parseLocale.run(locale.polls.loggingEmbed.description, { poll: `[${storedPoll.title}](${poll.url})`, channel: channel })}.`)
                    );
                });
                
                //Elimina el mensaje de la encuesta
                await poll.delete();

                //Elimina la encuesta de la BD
                delete client.db.polls[idKey];

                //Actualiza el fichero de la BD
                client.fs.writeFile('./storage/databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {

                    //Si encuentra un error, lo lanza por consola
                    if (err) throw err;
                });

            } else { //Si la encuesta aún no ha expirado

                //Calcula el tiempo restante
                const remainingTime = storedPoll.expiration - Date.now();

                //Calcula el formato del tiempo restante
                const remainingDays = Math.floor(remainingTime / (60 * 60 * 24 * 1000));
                const remainingHours = Math.floor((remainingTime - (remainingDays * 86400000)) / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remainingTime - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60 * 1000));

                //Almacena el anterior tiempo restante
                const oldRemainingTime = poll.footer;

                //Genera el string del nuevo footer
                const newRemainingTime = `ID: ${idKey} - ${await client.functions.utilities.parseLocale.run(locale.polls.progressEmbed.remaining, { remainingDays: remainingDays, remainingHours: remainingHours, remainingMinutes: remainingMinutes })}`;

                //Si el string de tiempo debería cambiar, edita el mensaje de la encuesta
                if (oldRemainingTime !== newRemainingTime) await poll.edit({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.polls)
                    .setAuthor({ name: locale.polls.progressEmbed.author, iconURL: 'attachment://poll.png' })
                    .setDescription(`${storedPoll.title}\n\n${storedPoll.options}`)
                    .setFooter({ text: newRemainingTime })
                ]});
            };
        };
    }, 5000);

    //XP POR VOZ
    //Comprobación de minutos de voz
    setInterval(async () => {

        //Por cada estado de voz de la BD
        for (let idKey in client.usersVoiceStates) {

            //Almacena el miembro
            const member = await client.functions.utilities.fetch.run(client, 'member', idKey);

            //Elimina el miembro de los etados de voz si ya no se encuentra voz
            if (!member || !member.voice.channelId) {

                //Elimina la entrada de los estados de voz
                delete client.usersVoiceStates[idKey];

                //Omite la iteración
                continue;
            };

            //Comprueba si el miembro está silenciado, ensordecido o solo con un bot
            if (member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(member => !member.user.bot).size === 1) return;

            //Añade XP al miembro
            await client.functions.leveling.addExperience.run(client, member, 'voice');

            //Actualiza el timestamp de la última recompensa de XP obtenida
            client.usersVoiceStates[member.id].lastXpReward = Date.now();
        };
        
    }, client.config.xp.XPGainInterval);

    //PRESENCIA
    //Actualización de miembros totales en presencia
    setInterval(async () => {

        try {

            //Si no se ha activado el conteo de miembros, ignora
            if (!client.config.presence.membersCount) return;

            //Genera el nuevo string para la actividad
            const name = `${await client.functions.utilities.parseLocale.run(locale.presence.name, { memberCount: await client.homeGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size) })} | ${client.config.presence.name}`;

            //Actualiza la presencia del bot
            await client.user.setPresence({
                status: client.config.presence.status,
                activities: [{
                    name: name,
                    type: client.config.presence.type
                }]
            });

        } catch (error) {

            //Si no se pudo obtener los miembros por un error temporal, aborta
            if (error.toString().includes('Members didn\'t arrive in time')) return;
        };

    }, 60000);

    console.log(` - [OK] ${locale.configLoaded}.`);
};
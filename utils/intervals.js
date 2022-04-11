exports.run = (client) => {

    //SILENCIADOS
    //Comprobación de miembros silenciados temporalmente
    setInterval(async () => {

        //Busca el rol silenciado (o lo crea si es necesario)
        const role = await client.functions.fetchRole(client.homeGuild, client.config.dynamic.mutedRoleId) || await client.functions.checkMutedRole(client.homeGuild);
        
        //Para cada uno de los silencios temporales de la BD
        for (let idKey in client.db.mutes) {

            //Almacena el tiempo de finalización del silenciamiento
            const endTime = client.db.mutes[idKey].time;

            //Omite si aún no ha expirado la sanción
            if (Date.now() < endTime) continue;
            
            //Busca el miembro
            const member = await client.functions.fetchMember(client.homeGuild, idKey);

            //Si el miembro estaba en la guild (y tenía el rol), se lo elimina
            if (member && member.roles.cache.has(mutedRole.id)) await member.roles.remove(role);

            //Bora el silenciamiento de la base de datos
            delete client.db.mutes[idKey];

            //Graba la nueva base de datos
            client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

                //Si hubo un error, lo devuelve
                if (err) throw err;

                //Ejecuta el manejador de registro
                await client.functions.loggingManager('embed', new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: `${member.user.tag} ha sido DES-SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addField('Miembro', member ? member.user.tag : `\`${idKey}\``, true)
                    .addField('Moderador', `${client.user}`, true)
                    .addField('Razón', 'Venció la amonestación', true)
                );
                
                //Envía una confirmación al miembro
                if (member) await member.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setAuthor({ name: '[DES-SILENCIADO]', iconURL: guild.iconURL({dynamic: true}) })
                    .setDescription(`${member ? member.user.tag : `\`${idKey}\``}, has sido des-silenciado en ${client.homeGuild.name}`)
                    .addField('Moderador', `${client.user}`, true)
                    .addField('Razón', 'Venció la amonestación', true)
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
            const endTime = client.db.bans[idKey].time;

            //Busca el usuario de Discord
            const user = await client.users.fetch(idKey);

            //Omite si aún no se ha de desbanear
            if (Date.now() < endTime) continue;

            //Elimina la entrada del baneo en la BD
            delete client.db.bans[idKey];

            //Vuelve a grabar la base de datos
            client.fs.writeFile('./databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

                //Si se genera un error, lo lanza
                if (err) throw err;

                try {

                    //Desbanea al usuario (si existe)
                    if (user) await client.homeGuild.members.unban(idKey);

                    //Ejecuta el manejador de registro
                    await client.functions.loggingManager('embed', new client.MessageEmbed()
                        .setColor(client.config.colors.correct)
                        .setAuthor({ name: `${user.tag} ha sido DES-BANEADO`, iconURL: user.displayAvatarURL({dynamic: true}) })
                        .addField('Usuario', user.tag, true)
                        .addField('Moderador', `${client.user}`, true)
                        .addField('Razón', 'Venció la amonestación', true)
                    );

                } catch (error) {

                    //Omite el error si el ban se eliminó manualmente
                    if (error.toString().includes('Unknown Ban')) return;

                    //Envía un mensaje de error a la consola
                    console.error(`${new Date().toLocaleString()} 》ERROR: `, error.stack);
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
            console.warn(`${new Date().toLocaleString()} 》AVISO: Tiempo de respuesta del Websocket elevado: ${actualPing} ms\n`);

            //Ejecuta el manejador de depuración
            await client.functions.debuggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })
                .setDescription(`${client.customEmojis.orangeTick} El tiempo de respuesta del Websocket es anormalmente alto: **${actualPing}** ms`)
            );
        };
    }, 60000);

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
            const channel = await client.functions.fetchChannel(client.homeGuild, storedPoll.channel);

            //Busca el mensaje de la encuesta
            const poll = await client.functions.fetchMessage(storedPoll.message, channel);

            //Si no se encontró el canal o la encuesta
            if (!channel || !poll) {

                //Elimina la encuesta de la BD
                delete client.db.polls[idKey];

                //Actualiza el fichero de la BD
                return client.fs.writeFile('./databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {

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
                    results.push(`🞄 ${votes[index].emoji} ${count} votos, el ${roundedPercentage}%`);
                };

                //Envía los resultados al canal de la encuesta
                await poll.channel.send({ embeds: [ new client.MessageEmbed()
                    .setAuthor({ name: 'Encuesta finalizada', iconURL: 'attachment://endFlag.png' })
                    .setDescription(`**${storedPoll.title}**\n\n${storedPoll.options}`)
                    .addField('Resultados', results.join(' '))
                ], files: ['./resources/images/endFlag.png']}).then(async poll => {

                    //Envía una notificación al canal de registro
                    await client.functions.loggingManager('embed', new client.MessageEmbed()
                        .setColor(client.config.colors.logging)
                        .setTitle('📑 Registro - [ENCUESTAS]')
                        .setDescription(`La encuesta "__[${storedPoll.title}](${poll.url})__" ha finalizado en el canal <#${storedPoll.channel}>.`)
                    );
                });
                
                //Elimina el mensaje de la encuesta
                await poll.delete();

                //Elimina la encuesta de la BD
                delete client.db.polls[idKey];

                //Actualiza el fichero de la BD
                client.fs.writeFile('./databases/polls.json', JSON.stringify(client.db.polls, null, 4), async err => {

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
                const newRemainingTime = `ID: ${idKey} - Restante: ${remainingDays}d ${remainingHours}h ${remainingMinutes}m `;

                //Si el string de tiempo debería cambiar, edita el mensaje de la encuesta
                if (oldRemainingTime !== newRemainingTime) await poll.edit({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.polls)
                    .setAuthor({ name: 'Encuesta disponible', iconURL: 'attachment://poll.png' })
                    .setDescription(`**${storedPoll.title}**\n\n${storedPoll.options}`)
                    .setFooter({ text: newRemainingTime })
                ], files: ['./resources/images/poll.png']});
            };
        };
    }, 5000);

    //XP POR VOZ
    //Comprobación de minutos de voz
    setInterval(async () => {

        //Por cada estado de voz de la BD
        for (let idKey in client.usersVoiceStates) {

            //Almacena el miembro
            const member = await client.functions.fetchMember(client.homeGuild, idKey);

            //Comprueba si el miembro está silenciado, ensordecido o está solo con un bot
            if (!member || member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(m => !m.user.bot).size === 1) return;

            //Añade XP al miembro
            await client.functions.addXP(member, client.homeGuild, 'voice');

            //Actualiza el timestamp de la última recompensa de XP obtenida
            client.usersVoiceStates[member.id].last_xpReward = Date.now();
        };
    }, client.config.xp.XPGainInterval);

    //PRESENCIA
    //Actualización de miembros totales en presencia
    setInterval(async () => {

        //Si no se ha activado el conteo de miembros, ignora
        if (!client.config.presence.membersCount) return;

        //Genera el nuevo string para la actividad
        const name = `${await client.homeGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size)} miembros | ${client.config.presence.name}`;

        //Actualiza la presencia del bot
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

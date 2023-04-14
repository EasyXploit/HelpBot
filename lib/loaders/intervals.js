//Exporta una función para cargar todos los programas ejecutados a intervalos
export async function loadIntervals() {

    //Traducciones de los intervalos
    const locale = client.locale.lifecycle.loadIntervals;

    //SILENCIADOS
    //Comprobación de miembros silenciados temporalmente
    setInterval(async () => {

        //Almacena los aislamiento del miembro 
        const memberTimeouts = await client.functions.db.getData('timeout');
        
        //Para cada uno de los silencios temporales de la BD
        for (let timeoutData of memberTimeouts) {

            //Omite si aún no ha expirado la sanción
            if (Date.now() < timeoutData.untilTimestamp) continue;
            
            //Busca el miembro
            const member = await client.functions.utils.fetch('member', timeoutData.userId);

            //Bora el aislamiento de la base de datos
            await client.functions.db.delData('timeout', timeoutData.userId);

            //Almacena el autor del embed para el logging
            let authorProperty = { name: member ? await client.functions.utils.parseLocale(locale.timeouts.loggingEmbed.author, { userTag: member.user.tag }) : locale.timeouts.loggingEmbed.authorNoMember };
            if (member) authorProperty.iconURL = member.user.displayAvatarURL({dynamic: true});
            
            //Ejecuta el manejador de registro
            await client.functions.managers.sendLog('untimeoutedMember', 'embed', new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor(authorProperty)
                .addFields(
                    { name: locale.timeouts.loggingEmbed.memberId, value: timeoutData.userId.toString(), inline: true },
                    { name: locale.timeouts.loggingEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.timeouts.loggingEmbed.reason, value: locale.timeouts.reason, inline: true }
                )
            );
            
            //Envía una confirmación al miembro
            if (member) await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor({ name: locale.timeouts.privateEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.timeouts.privateEmbed.description, { member: member, guildName: client.baseGuild.name }))
                .addFields(
                    { name: locale.timeouts.privateEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.timeouts.privateEmbed.reason, value: locale.timeouts.reason, inline: true }
                )
            ]});
        };
    }, 5000);

    //BANEOS
    //Comprobación de miembros baneados temporalmente
    setInterval(async () => {

        //Almacena la lista de baneos temporales
        const temporalBans = await client.functions.db.getData('ban');

        //Para cada uno de los baneos temporales de la BD
        for (let banData of temporalBans) {

            //Omite si aún no se ha de desbanear
            if (Date.now() < banData.untilTimestamp) continue;

            //Busca el usuario de Discord
            const user = await client.users.fetch(banData.userId);

            try {

                //Desbanea al usuario (si existe)
                if (user) await client.baseGuild.members.unban(banData.userId);

                //Elimina la entrada del baneo en la BD
                await client.functions.db.delData('ban', banData.userId);

                //Ejecuta el manejador de registro
                await client.functions.managers.sendLog('unbannedMember', 'embed', new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                    .setAuthor({ name: await client.functions.utils.parseLocale(locale.bans.loggingEmbed.author, { userTag: user.tag }), iconURL: user.displayAvatarURL({dynamic: true}) })
                    .addFields(
                        { name: locale.bans.loggingEmbed.user, value: user.tag, inline: true },
                        { name: locale.bans.loggingEmbed.moderator, value: `${client.user}`, inline: true },
                        { name: locale.bans.loggingEmbed.reason, value: locale.bans.reason, inline: true }
                    )
                );

            } catch (error) {

                //Omite el error si el ban se eliminó manualmente
                if (error.toString().includes('Unknown Ban')) return;

                //Envía un mensaje de error a la consola
                logger.error(error.stack);
            };
        };
    }, 5000);

    //PING
    //Comprobación del tiempo de respuesta del Websocket
    setInterval(async () => {

        //Almacena el ping actual
        const actualPing = Math.round(client.ping);

        //Si el ping desciende del umbral establecido
        if (actualPing > await client.functions.db.getConfig('system.pingMsTreshold')) {

            //Envía una advertencia a la consola
            logger.warn(`High websocket response time: ${actualPing} ms\n`);
        };
    }, 60000);

    //NOMBRES DE USUARIO
    //Comprobación de nombres de usuario de miembros
    if (await client.functions.db.getConfig('moderation.kickOnBadUsername')) setInterval(async () => {

        //Por cada uno de los miembros de la guild
        await client.baseGuild.members.cache.forEach(async guildMember => {

            //Comprueba si el nombre de usuario (visible) del miembro es válido
            await client.functions.moderation.checkUsername(guildMember);
        });

    }, 120000);

    //ENCUESTAS
    //Comprobación de encuestas expiradas
    setInterval(async () => {

        //Almacena la lista de encuestas en marcha
        const currentPolls = await client.functions.db.getData('poll');

        //Para cada una de las encuestas en la BD
        for (let pollData of currentPolls) {

            //Omite esta encuesta si no tiene expiración
            if (!pollData.expirationTimestamp) continue;

            //Busca el canal de la encuesta
            const channel = await client.functions.utils.fetch('channel', pollData.channelId);

            //Busca el mensaje de la encuesta
            const poll = await client.functions.utils.fetch('message', pollData.messageId, channel);

            //Si no se encontró el canal o la encuesta
            if (!channel || !poll) {

                //Elimina la encuesta de la BD
                await client.functions.db.delData('poll', pollData.pollId);
            };

            //Si la encuesta ya ha expirado
            if (Date.now() > pollData.expirationTimestamp) {

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
                    results.push(`🞄 ${votes[index].emoji} ${await client.functions.utils.parseLocale(locale.polls.votesPercentage, { votesCount: count, percentage: roundedPercentage })}`);
                };

                //Envía los resultados al canal de la encuesta
                await poll.channel.send({ embeds: [ new client.MessageEmbed()
                    .setAuthor({ name: locale.polls.finishedEmbed.author, iconURL: 'attachment://endFlag.png' })
                    .setDescription(`${pollData.title}\n\n${pollData.options}`)
                    .addFields({ name: locale.polls.finishedEmbed.results, value: results.join(' '), inline: false })
                ], files: ['./resources/images/endFlag.png']}).then(async poll => {

                    //Envía una notificación al canal de registro
                    await client.functions.managers.sendLog('pollEnded', 'embed', new client.MessageEmbed()
                        .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                        .setTitle(`📑 ${locale.polls.loggingEmbed.title}`)
                        .setDescription(`${await client.functions.utils.parseLocale(locale.polls.loggingEmbed.description, { poll: `[${pollData.title}](${poll.url})`, channel: channel })}.`)
                    );
                });
                
                //Elimina el mensaje de la encuesta
                await poll.delete();

                //Elimina la encuesta de la BD
                await client.functions.db.delData('poll', pollData.pollId);

            } else { //Si la encuesta aún no ha expirado

                //Calcula el tiempo restante
                const remainingTime = pollData.expiration - Date.now();

                //Calcula el formato del tiempo restante
                const remainingDays = Math.floor(remainingTime / (60 * 60 * 24 * 1000));
                const remainingHours = Math.floor((remainingTime - (remainingDays * 86400000)) / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remainingTime - (remainingHours * 3600000) - (remainingDays * 86400000)) / (60 * 1000));

                //Almacena el anterior tiempo restante
                const oldRemainingTime = poll.footer;

                //Genera el string del nuevo footer
                const newRemainingTime = `ID: ${idKey} - ${await client.functions.utils.parseLocale(locale.polls.progressEmbed.remaining, { remainingDays: remainingDays, remainingHours: remainingHours, remainingMinutes: remainingMinutes })}`;

                //Si el string de tiempo debería cambiar, edita el mensaje de la encuesta
                if (oldRemainingTime !== newRemainingTime) await poll.edit({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.polls')}`)
                    .setAuthor({ name: locale.polls.progressEmbed.author, iconURL: 'attachment://poll.png' })
                    .setDescription(`${pollData.title}\n\n${pollData.options}`)
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
            const member = await client.functions.utils.fetch('member', idKey);

            //Elimina el miembro de los estados de voz si ya no se encuentra voz
            if (!member || !member.voice.channelId) {

                //Elimina la entrada de los estados de voz
                delete client.usersVoiceStates[idKey];

                //Omite la iteración
                continue;
            };

            //Comprueba si el miembro está silenciado, ensordecido o solo con un bot
            if (member.voice.mute || member.voice.deaf || member.voice.channel.members.filter(member => !member.user.bot).size === 1) return;

            //Añade XP al miembro
            await client.functions.leveling.addExperience(member, 'voice', member.voice.channel);

            //Actualiza el timestamp de la última recompensa de XP obtenida
            client.usersVoiceStates[member.id].lastXpReward = Date.now();

            //Almacena el perfil del miembro, o lo crea
            let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });

            //Actualiza el tiempo de voz del miembro
            memberProfile.stats.aproxVoiceTime += await client.functions.db.getConfig('leveling.XPGainInterval');

            //Guarda las nuevas estadísticas del miembro en la base de datos
            await client.functions.db.setData('profile', member.id, memberProfile);
        };
        
    }, await client.functions.db.getConfig('leveling.XPGainInterval'));

    //PRESENCIA
    //Actualización de miembros totales en presencia
    setInterval(async () => {

        //Actualiza la presencia del bot
        await client.functions.managers.updatePresence();

    }, 60000);

    //Muestra un mensaje en la consola
    logger.debug('Intervals loading completed');
};

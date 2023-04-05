exports.run = async (client, locale) => {

    try {

        //Notifica el inicio de la carga del sistema
        logger.debug('Loading system ...');

        //Almacena la guild base en memoria
        client.baseGuild = await client.guilds.cache.get(await client.functions.db.getConfig.run('system.baseGuildId'));

        //Notifica que la carga de la guild base se ha completado
        logger.debug('Base guild loading completed');

        //Carga los customEmojis en el cliente
        await require('./loadEmojis.js').run(client);

        //Carga de comandos en memoria
        await require('./loadCommands.js').run(client);

        //Carga la presencia del bot
        await client.user.setPresence({
            status: client.config.presence.status,
            activities: [{
                name: client.config.presence.membersCount ? `${await client.functions.utilities.parseLocale.run(client.locale.lifecycle.loadIntervals.presence.name, { memberCount: await client.baseGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size) })} | ${client.config.presence.name}` : client.config.presence.name,
                type: client.config.presence.type
            }]
        });

        //Notifica la correcta carga de la presencia
        logger.debug('Presence loading completed');

        //Carga los scripts que funcionan a intervalos
        await require('./loadIntervals.js').run(client);

        //Carga los temporizadores configurados
        await require('./loadTimers.js').run(client);

        //Carga los estados de voz (si se su monitorización)
        if (client.config.leveling.rewardVoice) {

            //Almacena la caché de los estados de voz
            let voiceStates = client.baseGuild.voiceStates.cache;

            //Para cada estado de voz
            voiceStates.forEach(async voiceState => {

                //Almacena el miembro, si lo encuentra
                const member = await client.functions.utilities.fetch.run(client, 'member', voiceState.id);
                if (!member) return;

                //Comprueba si en el canal no se puede ganar XP
                if (member.user.bot || (voiceState.guild.afkChannelId && voiceState.channelId === voiceState.guild.afkChannelId)) {
                    if (client.usersVoiceStates[voiceState.id]) {

                        //Borra el registro del miembro que ha dejado el canal de voz
                        delete client.usersVoiceStates[voiceState.id];
                    };
                    return;
                };

                //Crea el objeto de estado de voz
                if (client.usersVoiceStates[voiceState.id]) client.usersVoiceStates[voiceState.id].channelId = voiceState.channelId
                else  {
                    client.usersVoiceStates[voiceState.id] = {
                        guild: voiceState.guild.id,
                        channelID: voiceState.channelId,
                        lastXpReward: Date.now()
                    };
                };
            });

            //Notifica la correcta carga de los estados de voz
            logger.debug('Voice states loading completed');
        };

        //Notifica la correcta carga del bot
        logger.info(`${await client.functions.utilities.parseLocale.run(locale.loadedCorrectly, { botUsername: client.user.username })}\n`);

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

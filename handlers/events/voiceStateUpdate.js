exports.run = async (oldState, newState, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (oldState.guild.id !== client.homeGuild.id) return;

        //Si el registro de cambios de canal de voz está activado, y no ocurrió un cambio entre canales ignorados
        voiceMovesIf: if (client.config.logging.voiceMoves && !(client.config.main.voiceMovesExcludedChannels.includes(oldState.channelId) && client.config.main.voiceMovesExcludedChannels.includes(newState.channelId))) {

            //Omite si solo se trata de un cambio que no implique cambio de canal
            if (oldState.channelId === newState.channelId) break voiceMovesIf;

            //Omite si el miembro se conecta o se desconecta de un canal excluido
            if (!oldState.channelId && client.config.main.voiceMovesExcludedChannels.includes(newState.channelId)) break voiceMovesIf;
            if (!newState.channelId && client.config.main.voiceMovesExcludedChannels.includes(oldState.channelId)) break voiceMovesIf;

            //Almacena los campos de anterior y nuevo canal, ofuscando los canales ignorados
            const oldChannel = oldState.channelId && !client.config.main.voiceMovesExcludedChannels.includes(oldState.channelId) ? `<#${oldState.channel.id}>` : `\`${await client.functions.utilities.parseLocale.run(locale.voiceMovesLogging.noChannel)}\``;
            const newChannel = newState.channelId && !client.config.main.voiceMovesExcludedChannels.includes(newState.channelId) ? `<#${newState.channel.id}>` : `\`${await client.functions.utilities.parseLocale.run(locale.voiceMovesLogging.noChannel)}\``;

            //Genera los campos de anterior y nuevo canal para el embed de registros
            let embedFields = [
                { name: await client.functions.utilities.parseLocale.run(locale.voiceMovesLogging.oldChannel), value: oldChannel, inline: true },
                { name: await client.functions.utilities.parseLocale.run(locale.voiceMovesLogging.newChannel), value: newChannel, inline: true }
            ];

            //Si hay un nuevo canal para el miemmbro y este no está ignorado
            if (newState.channelId && !client.config.main.voiceMovesExcludedChannels.includes(newState.channelId)) {

                //Genera y almacena un array con los tags de los miembros de dicho canal
                const channelMembers = Array.from(newState.channel.members, member => newState.channel.members.get(member[0]));

                //Añade un bloque de código con los tags de los miembros del canal al embed de registro
                embedFields.push({ name: `${await client.functions.utilities.parseLocale.run(locale.voiceMovesLogging.actualMembers)} (${newState.channel.members.size}/${newState.channel.userLimit != 0 ? newState.channel.userLimit : '∞'})`, value: `${channelMembers.join(', ')}`});
            };
    
            //Se formatea y envía un registro al canal especificado en la configuración
            await client.voiceMovesChannel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.voiceMovesLogging.embedAuthor, { memberTag: newState.member.user.tag }), iconURL: newState.member.user.displayAvatarURL({dynamic: true}) })
                .setFields(embedFields)
                .setTimestamp()
            ]});
        };

        //Aborta el resto de la ejecución si no están habilitadas las recompensas de XP
        if (!client.config.leveling.rewardVoice) return;

        //Función para que el miembro deje de ganar XP
        async function endVoiceTime() {

            //Si el timestamp actual es superior a los MS de intervalo de ganancia de XP configurado
            if (client.usersVoiceStates[newState.id] && Date.now() > (client.usersVoiceStates[newState.id].lastXpReward + client.config.leveling.XPGainInterval)) {

                //Almacena al miembro
                const member = await client.functions.utilities.fetch.run(client, 'member', newState.id);

                //Si el miembro está muteado o ensordecido, no hace nada
                if (!member || member.voice.mute || member.voice.deaf) return;

                //Almacena el canal
                const channel = await client.functions.utilities.fetch.run(client, 'channel', oldState.channelId);

                //Añade XP al miembro por última vez
                await client.functions.leveling.addExperience.run(client, member, 'voice', channel);

                //Si el miembro no tiene tabla de stats
                if (!client.db.stats[member.id]) {

                    //Crea la tabla del miembro
                    client.db.stats[member.id] = {
                        experience: 0,
                        level: 0,
                        lastMessage: 0,
                        aproxVoiceTime: 0,
                        messagesCount: 0,
                        notifications: {
                            public: true,
                            private: true
                        }
                    };
                };

                //Actualiza el tiempo de voz del miembro
                client.db.stats[member.id].aproxVoiceTime += client.config.leveling.XPGainInterval;

                //Guarda las nuevas estadísticas del miembro en la base de datos
                client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
                    if (err) throw err;
                });
            };
            
            //Borra el registro del miembro que ha dejado el canal de voz
            delete client.usersVoiceStates[newState.id];
        };

        //Si hay una nueva conexión o una antigua cambia
        if (newState.channel && newState.channel !== null && newState.channelId !== null) {

            //Almacena el miembro
            const member = newState.member;

            //Acaba el conteo de minutos si el miembro se queda solo o con únicamente bots en la sala
            if (newState.channel.members.filter(member => !member.user.bot).size === 1 && client.usersVoiceStates[newState.id]) return endVoiceTime();

            //Si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            if (member.user.bot || newState.channelId === newState.guild.afkChannel.id) {

                //Si el miembro tenía un estado de voz almacenado
                if (client.usersVoiceStates[newState.id]) {

                    //Borra el registro del miembro que ha dejado el canal de voz
                    delete client.usersVoiceStates[newState.id];
                };

                //Aborta el resto del programa
                return;
            };

            //Si solo se ha cambiado de sala
            if (client.usersVoiceStates[newState.id]) {

                //Cambia el ID del canal actual
                client.usersVoiceStates[newState.id].channelID = newState.channelId

            } else { //Si se ha conectado desde 0

                //Crea una nueva entrada en la lista de estados de voz
                client.usersVoiceStates[newState.id] = {
                    guild: newState.guild.id,
                    channelID: newState.channelId,
                    lastXpReward: Date.now()
                };
            };

        } else if (!newState.channel || newState.channelId == null || newState.channel == null) { //Si la conexión desaparece

            //Finbaliza el intervalo de ganancia de XP para el miembro
            endVoiceTime();
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.eventError.run(client, error);
    };
};

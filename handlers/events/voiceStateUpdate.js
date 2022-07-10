exports.run = async (oldState, newState, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (oldState.guild.id !== client.homeGuild.id) return;

        //Si el bot está conectado
        if (newState.guild.me.voice.channelId) {

            //Almacena la información de reproducción de la guild
            const reproductionQueue = client.reproductionQueues[newState.guild.id];

            //Almacena el número de miembros del canal de voz
            const memberCount = oldState.guild.me.voice.channel.members.filter(member => !member.user.bot).size;

            //Si el bot se queda solo o con únicamente bots en el canal
            if (memberCount === 0) {

                //Crea un contador para demorar la salida del canal y la destrucción de la cola
                if (reproductionQueue) reproductionQueue.timeout = setTimeout(async () => {

                    //Método para obtener conexiones de voz
                    const { getVoiceConnection } = require('@discordjs/voice');

                    //Almacena la conexión de voz del bot (si tiene)
                    const connection = await getVoiceConnection(newState.guild.id);

                    //Aborta la conexión
                    if (connection && connection.state.status !== 'Destroyed') connection.destroy();

                    //Confirma la acción
                    reproductionQueue.boundedTextChannel.send({ content: `⏏ | ${locale.leftWhenIdle}` });

                    //Borra la información de reproducción de la guild
                    delete client.reproductionQueues[newState.guild.id];

                }, client.config.music.maxIdleTime);

            } else if (memberCount !== 0 && reproductionQueue && reproductionQueue.timeout && reproductionQueue.tracks.length > 0) { //Si el canal recupera un mínimo de miembros

                //Método para obtener conexiones de voz
                const { getVoiceConnection } = require('@discordjs/voice');

                //Almacena la conexión de voz del bot
                const connection = await getVoiceConnection(newState.guild.id);

                //Almacena el reproductor suscrito
                const player = connection._state.subscription.player;
                
                //Si el reproductor no estaba pausado
                if (player.state.status !== 'paused') {

                    //Finalzia el timeout
                    clearTimeout(reproductionQueue.timeout);

                    //Anula la variable del timeout
                    reproductionQueue.timeout = null;
                };
            };
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

                //Añade XP al miembro por última vez
                await client.functions.leveling.addExperience.run(client, member, 'voice', member.voice.channelId);

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
        await client.functions.managers.eventError.run(client, error, 'voiceStateUpdate');
    };
};

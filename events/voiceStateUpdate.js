exports.run = async (oldState, newState, client) => {
    
    try {

        //Devuelve si no están habilitadas las recompensas de XP
        if (!client.config.xp.rewardVoice) return;

        async function endVoiceTime() {
            //Si el timestamp actual es superior a los MS de intervalo de ganancia de XP configurado, le asigna XP
            if (client.usersVoiceStates[newState.id] && Date.now() > (client.usersVoiceStates[newState.id].lastXpReward + client.config.xp.XPGainInterval)) {

                //Almacena el miembro, y si está muteado o ensordecido, no hace nada
                const member = await client.functions.fetchMember(newState.guild, newState.id);
                if (!member || member.voice.mute || member.voice.deaf) return;

                //Llama al manejador de leveling
                await client.functions.addXP(member, newState.guild, 'voice');
            };
            
            //Borra el registro del miembro que ha dejado el canal de voz
            delete client.usersVoiceStates[newState.id];
        };

        if (newState.channel && newState.channel !== null && newState.channelId !== null) { //Si hay una nueva conexión o una antigua cambia

            //Almacena el miembro
            const member = await client.functions.fetchMember(newState.guild, newState.id);
            if (!member) return;

            //Acaba el conteo de minutos si el miembro se queda solo o con únicamente bots en la sala
            if (newState.channel.members.filter(m => !m.user.bot).size === 1 && client.usersVoiceStates[newState.id]) {
                return endVoiceTime();
            };

            //Calcula si el miembro tiene un rol que no puede ganar XP
            let nonXPRole;
            for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {
                if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {
                    nonXPRole = true;
                    break;
                };
            };

            //No sigue si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            if (member.user.bot || client.config.xp.nonXPChannels.includes(newState.channelId) || newState.channelId === newState.guild.afkChannel.id || nonXPRole) {
                if (client.usersVoiceStates[newState.id]) {
                    //Borra el registro del miembro que ha dejado el canal de voz
                    delete client.usersVoiceStates[newState.id];
                }
                return;
            };

            //Si solo se ha cambiado de sala, solo cambia el ID del canal actual
            if (client.usersVoiceStates[newState.id]) {
                client.usersVoiceStates[newState.id].channelID = newState.channelId
            } else  { //Si se ha conectado desde 0, le crea una nueva entrada en la lista de estados de voz
                client.usersVoiceStates[newState.id] = {
                    guild: newState.guild.id,
                    channelID: newState.channelId,
                    lastXpReward: Date.now()
                };
            };
        } else if (!newState.channel || newState.channelId == null || newState.channel == null) { //Si la conexión desaparece
            endVoiceTime();
        };
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.eventErrorHandler(error, 'voiceStateUpdate');
    };
};

exports.run = async (oldState, newState, client) => {
    
    try {

        //Aborta si no están habilitadas las recompensas de XP
        if (!client.config.xp.rewardVoice) return;

        //Función para que el miembro deje de ganar XP
        async function endVoiceTime() {

            //Si el timestamp actual es superior a los MS de intervalo de ganancia de XP configurado
            if (client.usersVoiceStates[newState.id] && Date.now() > (client.usersVoiceStates[newState.id].lastXpReward + client.config.xp.XPGainInterval)) {

                //Almacena al miembro
                const member = await client.functions.fetchMember(newState.guild, newState.id);

                //Si el miembro está muteado o ensordecido, no hace nada
                if (!member || member.voice.mute || member.voice.deaf) return;

                //Añade XP al miembro por última vez
                await client.functions.addXP(member, 'voice');
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

            //Almacena si el miembro tiene un rol que no puede ganar XP
            let nonXPRole;

            //Por cada uno de los roles que no pueden ganar XP
            for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {

                //Si alguno de los roles del miembro coincide, cambia el valor de la variable y para el bucle
                if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {
                    nonXPRole = true;
                    break;
                };
            };

            //Si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            if (member.user.bot || client.config.xp.nonXPChannels.includes(newState.channelId) || newState.channelId === newState.guild.afkChannel.id || nonXPRole) {

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
        await client.functions.eventErrorHandler(error, 'voiceStateUpdate');
    };
};

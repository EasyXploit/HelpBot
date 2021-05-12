exports.run = async (oldState, newState, client, discord) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es el principal
        if (newState.guild.id !== client.homeGuild.id) return;

        async function endVoiceTime() {
            //Si el timestamp actual es superior a los MS de intervalo de ganancia de XP configurado, le asigna XP
            if (client.usersVoiceStates[newState.id] && Date.now() > (client.usersVoiceStates[newState.id].last_xpReward + client.config.xp.XPGainInterval)) {

                //Almacena el miembro, y si está muteado o ensordecido, no hace nada
                const member = await client.functions.fetchMember(newState.guild, newState.id);
                if (!member || member.voice.mute || member.voice.deaf) return;

                //Llama al manejador de leveling
                await client.functions.addXP(member, newState.guild, 'voice');
            };
            
            //Borra el registro del miembro que ha dejado el canal de voz
            delete client.usersVoiceStates[newState.id];
        };

        if (newState.channelID !== null) { //Si hay una nueva conexión o una antigua cambia

            //Almacena el miembro
            const member = await client.functions.fetchMember(newState.guild, newState.id);
            if (!member) return;

            //Acaba el conteo de minutos si el miembro se queda solo o con únicamente bots en la sala
            if (newState.channel.members.filter(m => !m.user.bot).size === 1 && client.usersVoiceStates[newState.id]) {
                return endVoiceTime();
            };

            //Calcula si el miembro tiene un rol que no puede ganar XP
            let nonXPRole;
            for (let i = 0; i < client.config.voice.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === client.config.voice.nonXPRoles[i])) {
                    nonXPRole = true;
                    break;
                };
            };

            //No sigue si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            if (member.user.bot || client.config.voice.nonXPChannels.includes(newState.channelID) || newState.channelID === newState.guild.afkChannel.id || nonXPRole) {
                if (client.usersVoiceStates[newState.id]) {
                    //Borra el registro del miembro que ha dejado el canal de voz
                    delete client.usersVoiceStates[newState.id];
                }
                return;
            };

            //Si solo se ha cambiado de sala, solo cambia el ID del canal actual
            if (client.usersVoiceStates[newState.id]) {
                client.usersVoiceStates[newState.id].channelID = newState.channelID
            } else  { //Si se ha conectado desde 0, le crea una nueva entrada en la lista de estados de voz
                client.usersVoiceStates[newState.id] = {
                    guild: newState.guild.id,
                    channelID: newState.channelID,
                    last_xpReward: Date.now()
                };
            };
        } else if (newState.channelID == null) { //Si la conexión desaparece
            endVoiceTime();
        };
    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(client.colors.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `voiceStateUpdate`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.debuggingChannel.send(debuggEmbed);
    };
};

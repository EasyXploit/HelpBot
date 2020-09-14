exports.run = async (oldState, newState, discord, fs, config, keys, client, resources) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (newState.guild.id !== `374945492133740544`) return;

        if (newState.channelID != null) { //Si hay una nueva conexión o una antigua cambia

            //Almacena el miembro
            const member = await resources.fetchMember(newState.guild, newState.id);
            if (!member) return;

            //Calcula si el miembro tiene un rol que no puede ganar XP
            let nonXPRole;
            for (let i = 0; i < config.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === config.nonXPRoles[i])) {
                    nonXPRole = true;
                    break;
                };
            };

            //No sigue si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            if (member.user.bot || config.nonXPChannels.includes(newState.channelID) || newState.channelID === newState.guild.afkChannel.id || nonXPRole) {
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

            //Si el timestamp actual es superior a los MS de intervalo de ganancia de XP configurado, le asigna XP
            if (client.usersVoiceStates[newState.id] && Date.now() > (client.usersVoiceStates[newState.id].last_xpReward + config.XPVoiceMinutes)) {

                //Almacena el miembro, y si está muteado o ensordecido, no hace nada
                const member = await resources.fetchMember(newState.guild, newState.id);
                if (!member || member.voice.mute || member.voice.deaf) return;

                //Llama al manejador de leveling
                await resources.addXP(fs, config, member, newState.guild, 'voice');
            };
            
            //Borra el registro del miembro que ha dejado el canal de voz
            delete client.usersVoiceStates[newState.id];
        };

    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `voiceStateUpdate`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``)
            .setFooter(new Date().toLocaleString(), resources.server.iconURL()).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await client.channels.cache.get(config.debuggingChannel).send(debuggEmbed);
    }
}
    
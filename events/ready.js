exports.run = async (event, client, discord) => {
    try {
        //Carga de configuración de la guild
        client.homeGuild = client.guilds.cache.get(client.config.guild.homeGuild);
        client.loggingChannel = client.channels.cache.get(client.config.guild.loggingChannel);
        client.debuggingChannel = client.channels.cache.get(client.config.guild.debuggingChannel);
        client.welcomeChannel = client.channels.cache.get(client.config.guild.welcomeChannel);
        client.pilkoChatChannel = client.channels.cache.get(client.config.guild.pilkoChatChannel);
        console.log('\n - [OK] Carga de configuración de la guild.');

        //Carga de recursos globales
        require('../utils/functions.js').run(discord, client);
        require('../utils/emotes.js').run(client);
        console.log(' - [OK] Carga de recursos globales.');

        //Carga de presencia
        await client.user.setPresence({
            status: client.config.presence.status,
            activity: {
                name: client.config.presence.membersCount ? `${client.homeGuild.members.cache.filter(member => !member.user.bot).size} miembros | ${client.config.presence.name}` : client.config.presence.name,
                type: client.config.presence.type
            }
        });
        console.log(' - [OK] Carga de presencia.');

        //Carga de intervalos
        require('../utils/intervals.js').run(discord, client);
        console.log(' - [OK] Carga de intervalos.');

        //Carga de estados de voz
        let voiceStates = client.homeGuild.voiceStates.cache;
        voiceStates.forEach(async voiceState => {

            //No sigue si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            const member = await client.functions.fetchMember(voiceState.guild, voiceState.id);
            if (!member) return;

            let nonXPRole;
            for (let i = 0; i < client.config.voice.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === client.config.voice.nonXPRoles[i])) {
                    nonXPRole = true;
                    break;
                };
            };

            if (member.user.bot || client.config.voice.nonXPChannels.includes(voiceState.channelID) || voiceState.channelID === voiceState.guild.afkChannel.id || nonXPRole) {
                if (client.usersVoiceStates[voiceState.id]) {
                    //Borra el registro del miembro que ha dejado el canal de voz
                    delete client.usersVoiceStates[voiceState.id];
                };
                return;
            };

            if (client.usersVoiceStates[voiceState.id]) {
                client.usersVoiceStates[voiceState.id].channelID = voiceState.channelID
            } else  {
                client.usersVoiceStates[voiceState.id] = {
                    guild: voiceState.guild.id,
                    channelID: voiceState.channelID,
                    last_xpReward: Date.now()
                };
            };
        });
        console.log(' - [OK] Carga de estados de voz.');

        //Auditoría
        console.log(`\n 》${client.user.username} iniciado correctamente \n  ● Estado de actividad: ${client.config.presence.status}\n  ● Tipo de actividad: ${client.config.presence.type}\n  ● Nombre de actividad: ${client.config.presence.name}\n  ● ¿Conteo de miembros?: ${client.config.presence.membersCount}\n`);
        client.debuggingChannel.send(`${client.user.username} iniciado correctamente [<@${client.config.guild.botOwner}>]`).then(msg => {msg.delete({timeout: 5000})});
    } catch (e) {
        return console.error(`${new Date().toLocaleString()} 》${e.stack}`);
    };
};

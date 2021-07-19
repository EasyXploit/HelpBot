exports.run = async (discord, client) => {

    console.log('\n - Cargando el sistema.\n');

    //Carga en memoria de los recursos de la guild necesarios para el bot
    const loadGuildSettings = new Promise((resolve, reject) => {
        Object.keys(client.config.guild).forEach(async (config, index, array) => {

            //Comprueba de qué forma tiene que cargar cada configuración
            if (config === 'homeGuild') {
                client[config] = await client.guilds.cache.get(client.config.guild[config]);
            }  else if (config.toLowerCase().includes('channel')) {
                try {
                    client[config] = await client.channels.fetch(client.config.guild[config]);
                    console.log(` - [OK] [${config}] cargado correctamente`);
                } catch (error) {
                    console.log(` - [ERROR] [${config}] no se pudo cargar`);
                };
            } else {
                client[config] = await client.config.guild[config];
            };

            //Resuelve la promesa una vez acabado
            if (index === array.length -1) resolve();
        });
    });
    
    //Cuando se carguen en memoria todos los recursos
    await loadGuildSettings.then(async () => {
        console.log('\n - [OK] Carga de configuración de la guild.');

        //Carga de funciones globales
        require('../utils/functions.js').run(discord, client);

        //Carga de customEmojis de sistema en la guild (si no los tiene ya)
        if (client.homeGuild) await client.functions.uploadSystemEmojis();

        //Carga de customEmojis globales
        await require('./customEmojis.js').run(client);

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
        require('./intervals.js').run(discord, client);

        //Carga de estados de voz
        let voiceStates = client.homeGuild.voiceStates.cache;
        voiceStates.forEach(async voiceState => {

            //No sigue si es un bot, el canal de AFK, un canal prohibido o un rol prohibido
            const member = await client.functions.fetchMember(voiceState.guild, voiceState.id);
            if (!member) return;

            let nonXPRole;
            for (let i = 0; i < client.config.xp.nonXPRoles.length; i++) {
                if (await member.roles.cache.find(r => r.id === client.config.xp.nonXPRoles[i])) {
                    nonXPRole = true;
                    break;
                };
            };

            if (member.user.bot || client.config.xp.nonXPChannels.includes(voiceState.channelID) || voiceState.channelID === voiceState.guild.afkChannel.id || nonXPRole) {
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
        console.log(`\n 》${client.user.username} iniciado correctamente`);
        if (client.debuggingChannel) client.debuggingChannel.send(`${client.user.username} iniciado correctamente [${client.homeGuild.owner}]`).then(msg => {msg.delete({timeout: 5000})});
    });
};
exports.run = async (client) => {

    console.log('\n - Cargando el sistema.\n');

    //Carga en memoria de los recursos de la guild necesarios para el bot
    const loadGuildSettings = new Promise((resolve, reject) => {
        Object.keys(client.config.main).forEach(async (config, index, array) => {

            //Comprueba de qué forma tiene que cargar cada configuración
            if (config === 'homeGuild') {
                client[config] = await client.guilds.cache.get(client.config.main[config]);
            }  else if (config.toLowerCase().includes('channel')) {
                try {
                    client[config] = await client.channels.fetch(client.config.main[config]);
                    console.log(` - [OK] [${config}] cargado correctamente`);
                } catch (error) {
                    console.log(` - [ERROR] [${config}] no se pudo cargar`);
                };
            } else {
                client[config] = await client.config.main[config];
            };

            //Resuelve la promesa una vez acabado
            if (index === array.length -1) resolve();
        });
    });
    
    //Cuando se carguen en memoria todos los recursos
    await loadGuildSettings.then(async () => {
        console.log('\n - [OK] Carga de configuración de la guild.');

        //Carga de funciones globales
        require('../utils/functions.js').run(client);

        //Carga de customEmojis de sistema en la guild (si no los tiene ya)
        if (client.homeGuild) await client.functions.uploadSystemEmojis();

        //Carga de customEmojis globales
        await require('./customEmojis.js').run(client);

        //Carga de presencia
        await client.user.setPresence({
            status: client.config.presence.status,
            activities: [{
                name: client.config.presence.membersCount ? `${await client.homeGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size)} miembros | ${client.config.presence.name}` : client.config.presence.name,
                type: client.config.presence.type
            }]
        });
        console.log(' - [OK] Carga de presencia.');

        //Carga de intervalos
        require('./intervals.js').run(client);

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

            if (member.user.bot || client.config.xp.nonXPChannels.includes(voiceState.channelId) || voiceState.channelId === voiceState.guild.afkChannel.id || nonXPRole) {
                if (client.usersVoiceStates[voiceState.id]) {
                    //Borra el registro del miembro que ha dejado el canal de voz
                    delete client.usersVoiceStates[voiceState.id];
                };
                return;
            };

            if (client.usersVoiceStates[voiceState.id]) {
                client.usersVoiceStates[voiceState.id].channelId = voiceState.channelId
            } else  {
                client.usersVoiceStates[voiceState.id] = {
                    guild: voiceState.guild.id,
                    channelID: voiceState.channelId,
                    last_xpReward: Date.now()
                };
            };
        });
        console.log(' - [OK] Carga de estados de voz.');

        //Auditoría
        console.log(`\n 》${client.user.username} iniciado correctamente`);
        if (client.debuggingChannel) client.debuggingChannel.send({ content: `${client.user.username} iniciado correctamente [<@${client.homeGuild.ownerId}>]` }).then(msg => {setTimeout(() => msg.delete(), 5000)});
    });
};

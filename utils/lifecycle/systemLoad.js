exports.run = async (client) => {

    try {

        //Notifica el inicio de la carga del sistema
        console.log(`\n - ${client.locale.utils.lifecycle.systemLoad.loadingSystem} ...\n`);

        //Carga en memoria de los recursos de la guild necesarios para el bot
        const loadGuildSettings = new Promise(async (resolve, reject) => {

            //Almacena la guild base en memoria
            client.homeGuild = await client.guilds.cache.get(client.config.dynamic.homeGuild);

            //Carga cada una de las claves del objeto de config. main
            const mainConfigs = Object.keys(client.config.main);

            //Para cada una de las claves de configuración
            for (let index = 0; index < mainConfigs.length; index++) {

                //Almacena la configuración
                const config = mainConfigs[index];

                //Comprueba de qué forma tiene que cargar cada configuración
                if (config.toLowerCase().includes('channel')) { //Si es config. de canal

                    try {

                        //Busca el canal y lo carga en memoria
                        client[config] = await client.channels.fetch(client.config.main[config]);

                        //Notifica la resolución positiva de la carga
                        console.log(` - [OK] [${config}] -> ${client.locale.utils.lifecycle.systemLoad.configLoaded}`);

                    } catch (error) {

                        //Notifica la resolución negativa de la carga
                        console.log(` - [ERROR] [${config}] -> ${client.locale.utils.lifecycle.systemLoad.configNotLoaded}`);
                    };
                } else { //Sino

                    //Carga el objeto de config en memoria
                    client[config] = client.config.main[config];
                };

                //Resuelve la promesa una vez acabado
                if (index === mainConfigs.length -1) resolve();
            };
        });
        
        //Cuando se carguen en memoria todos los recursos
        await loadGuildSettings.then(async () => {

            //Notifica que la carga se ha completado
            console.log(`\n - [OK] ${client.locale.utils.lifecycle.systemLoad.guildConfigLoaded}.`);

            //Carga las funciones globales
            require('../functions.js').run(client);

            //Carga los customEmojis en el cliente
            await require('./loadEmojis.js').run(client);

            //Carga la presencia del bot
            await client.user.setPresence({
                status: client.config.presence.status,
                activities: [{
                    name: client.config.presence.membersCount ? `${client.functions.localeParser(client.locale.utils.intervals.presence.name, { memberCount: await client.homeGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size) })} | ${client.config.presence.name}` : client.config.presence.name,
                    type: client.config.presence.type
                }]
            });

            //Notifica la correcta carga de la presencia
            console.log(` - [OK] ${client.locale.utils.lifecycle.systemLoad.presenceLoaded}.`);

            //Carga los scripts que funcionan a intervalos
            require('../intervals.js').run(client);

            //Carga los temporizadores configurados
            await require('../timers.js').run(client);

            //Carga los estados de voz (si se su monitorización)
            if (client.config.xp.rewardVoice) {

                //Almacena la caché de los estados de voz
                let voiceStates = client.homeGuild.voiceStates.cache;

                //Para cada estado de voz
                voiceStates.forEach(async voiceState => {

                    //Almacena el miembro, si lo encuentra
                    const member = await client.functions.fetchMember(voiceState.guild, voiceState.id);
                    if (!member) return;

                    //Comprueba si el rol no puede ganar XP
                    let nonXPRole;
                    for (let index = 0; index < client.config.xp.nonXPRoles.length; index++) {
                        if (await member.roles.cache.find(role => role.id === client.config.xp.nonXPRoles[index])) {
                            nonXPRole = true;
                            break;
                        };
                    };

                    //Comprueba si en el canal no se puede ganar XP
                    if (member.user.bot || client.config.xp.nonXPChannels.includes(voiceState.channelId) || voiceState.channelId === voiceState.guild.afkChannel.id || nonXPRole) {
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
                console.log(` - [OK] ${client.locale.utils.lifecycle.systemLoad.voiceStatesLoaded}.`);
            };

            //Notifica la correcta carga del bot
            console.log(`\n 》${client.functions.localeParser(client.locale.utils.lifecycle.systemLoad.loadedCorrectly, { botUsername: client.user.username })}.`);

            //Genera un registro en el canal de registro
            if (client.debuggingChannel && client.config.main.loadMention) client.debuggingChannel.send({ content: `${client.functions.localeParser(client.locale.utils.lifecycle.systemLoad.loadMention, { botUsername: client.user.username })} [<@${client.homeGuild.ownerId}>]` }).then(msg => { setTimeout(() => msg.delete(), 5000) });
        });

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} ${client.locale.utils.lifecycle.systemLoad.error}:`, error.stack);
    };
};

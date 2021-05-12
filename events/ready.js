exports.run = async (event, client, discord) => {
    try {
        //Carga de configuración de la guild
        client.homeGuild = client.guilds.cache.get(client.config.guild.homeGuild);
        client.loggingChannel = client.channels.cache.get(client.config.guild.loggingChannel);
        client.debuggingChannel = client.channels.cache.get(client.config.guild.debuggingChannel);
        client.welcomeChannel = client.channels.cache.get(client.config.guild.welcomeChannel);
        client.pilkoChatChannel = client.channels.cache.get(client.config.guild.pilkoChatChannel);

        //Carga de recursos globales
        require('../utils/functions.js').run(discord, client);
        require('../utils/emotes.js').run(client);

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

        //Auditoría
        console.log(`\n 》${client.user.username} iniciado correctamente \n  ● Estado de actividad: ${client.config.presence.status}\n  ● Tipo de actividad: ${client.config.presence.type}\n  ● Nombre de actividad: ${client.config.presence.name}\n  ● ¿Conteo de miembros?: ${client.config.presence.membersCount}\n`);

        const package = require('../package.json');

        let statusEmbed = new discord.MessageEmbed()
            .setTitle('📑 Estado de ejecución')
            .setColor(client.colors.gold)
            .setDescription(`${client.user.username} iniciado correctamente`)
            .addField('Estatus:', client.config.presence.status, true)
            .addField('Tipo de actividad:', client.config.presence.type, true)
            .addField('Actividad:', client.config.presence.name, true)
            .addField('Usuarios:', client.users.cache.filter(user => !user.bot).size, true)
            .addField('Versión:', package.version, true)
            .setFooter(`${client.user.username} • Este mensaje se borrará en 10s`, client.user.avatarURL());
        client.debuggingChannel.send(statusEmbed).then(msg => {msg.delete({timeout: 10000})});
        client.debuggingChannel.send(`<@${client.config.guild.botOwner}>`).then(msg => {msg.delete({timeout: 1000})});
    } catch (e) {
        console.error(`${new Date().toLocaleString()} 》${e.stack}`);
    };
};

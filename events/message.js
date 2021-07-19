exports.run = async (message, client, discord) => {

    if (message.author.bot || message.type !== 'DEFAULT') return;
    if (message.channel.type === 'dm') {
        if (!message.content) return;

        const pilkoChatEmbed = new discord.MessageEmbed()
            .setColor(client.colors.blue2)
            .setAuthor(`Mensaje de: ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
            .setDescription(message.content);

        await client.botChatChannel.send(pilkoChatEmbed);

        //Filtra el texto en busca de códigos de invitación
        let detectedInvites = message.content.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s\/]+?(?=\b)/gm);

        //Si se encontraron invitaciones, se comprueba que no sean de la guild
        if (detectedInvites) {
            let legitInvites = 0;

            await client.homeGuild.fetchInvites().then(guildInvites => {

                let inviteCodes = Array.from(guildInvites.keys());

                detectedInvites.forEach(filteredInvite => {
                    inviteCodes.forEach(inviteCode => {
                        if (filteredInvite.includes(inviteCode)) legitInvites++;
                    });
                });
            });

            //Si alguna no lo es, lo banea
            if (legitInvites < detectedInvites.length) {
                const member = await client.functions.fetchMember(client.homeGuild, message.author.id);
                if ((member.joinedTimestamp + client.config.automod.newMemberTimeDelimiter) < Date.now()) {
                    client.bans[member.id] = {
                        time: Date.now() + client.config.automod.newSpammerMemberBanDuration
                    };

                    let toDMEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.red2)
                        .setAuthor('[EXPULSADO]', client.homeGuild.iconURL())
                        .setDescription(`<@${member.id}>, has sido expulsado de ${client.homeGuild.name}`)
                        .addField('Moderador', client.user.tag, true)
                        .addField('Razón', 'Spam vía MD', true);

                    await member.send(toDMEmbed);
                    return await member.kick(`Moderador: ${client.user.id}, Razón: Spam vía MD al bot`);
                } else {
                    let toDMEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.red)
                        .setAuthor(`[BANEADO]`, client.homeGuild.iconURL())
                        .setDescription(`<@${member.id}>, has sido baneado en ${client.homeGuild.name}`)
                        .addField('Moderador', client.user.tag, true)
                        .addField('Razón', 'Spam vía MD', true)
                        .addField('Duración', '14d', true);

                    await member.send(toDMEmbed);
                    return await client.homeGuild.members.ban(member, {reason: `Moderador: ${client.user.id}, Duración: 14d, Razón: Spam vía MD al bot`});
                };
            };
        };

        const noDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gray)
            .setDescription(`${client.customEmojis.grayTick} | Por el momento, los comandos de **${client.user.username}** solo está disponible desde el servidor.`);

        if (message.content.startsWith(client.config.guild.prefix) || message.content.startsWith(client.config.guild.prefix) || message.content.startsWith(client.config.guild.prefix)) return await message.author.send(noDMEmbed);

        if (!client.dmContexts[message.author.id]) client.dmContexts[message.author.id] = ['Hablemos en Español'];

        return await client.cleverbot(message.content, client.dmContexts[message.author.id]).then(async response => {
            if (client.dmContexts[message.author.id] && !message.content.includes('http')) client.dmContexts[message.author.id].push(message.content);

                let dmChannel = message.author.dmChannel;

                setTimeout(async () => {
                    dmChannel.startTyping();

                    setTimeout(async () => {
                        dmChannel.stopTyping();
                        message.author.send(response);

                        const pilkoChatEmbed = new discord.MessageEmbed()
                            .setColor(client.colors.primary)
                            .setAuthor(`Mensaje de: ${client.user.username}`, client.user.displayAvatarURL({dynamic: true}))
                            .setDescription(response);

                        await client.botChatChannel.send(pilkoChatEmbed);
                    }, Math.floor(Math.random() * (8000 - 5000 + 1) + 5000));
                }, Math.floor(Math.random() * (3000 - 2000 + 1) + 2000));
        });
    };

    //FILTROS DE AUTO-MODERACIÓN
    (async () => {
        for (var key in client.config.automodFilters) {
            await (async () => {
                if (client.config.automodFilters[key].status) {
                    //Comprueba si el miembro tiene algún rol permitido
                    const bypassRoles = client.config.automodFilters[key].bypassRoles;
                    const bypassChannels = client.config.automodFilters[key].bypassChannels;

                    if (bypassChannels.includes(message.channel.id)) return;
    
                    for (let i = 0; i < bypassRoles.length; i++) {
                        if (message.member.roles.cache.has(bypassRoles[i])) return;
                    }

                    await client.automodFiltering[key](message).then(match => {
                        if (match) require('../utils/infractionsHandler.js').run(discord, client, message, message.guild, message.member, client.config.automodFilters[key].reason, client.config.automodFilters[key].action, client.user, message.content);
                    });
                }
            })();
        };
    })();

    //Llama al manejador de leveling
    if (!message.content.startsWith(client.config.guild.prefix) && !client.config.xp.nonXPChannels.includes(message.channel.id)) return await client.functions.addXP(message.member, message.guild, 'message', message.channel);

    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(client.config.guild.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command = `${cmd}.js`;

    if (command.length <= 0) return console.error(`${new Date().toLocaleString()} 》No hubo ningún comando a cargar`);

    // Función para ejecutar el comando
    try {
        //Comprueba si es un comando con prefijo
        if (message.content.startsWith(client.config.guild.prefix)) {
            let waitEmbed = new discord.MessageEmbed().setColor(client.colors.red2).setDescription(`${client.customEmojis.redTick} Debes esperar 2 segundos antes de usar este comando`);
            if (client.cooldownedUsers.has(message.author.id)) return message.channel.send(waitEmbed).then(msg => {msg.delete({timeout: 1000})});

            //Almacena la configuración del comando
            let commandConfig = client.config.commands[cmd];

            //Devuelve si el comando está deshabilitado
            if (!commandConfig || !commandConfig.enabled) return;

            //Devuelve si el canal no está autorizado
            if (commandConfig.whitelistedChannels.length > 0 && !commandConfig.whitelistedChannels.includes(message.channel.id)) return;
            if (commandConfig.blacklistedChannels.length > 0 && commandConfig.whitelistedChannels.includes(message.channel.id)) return;

            //Carga el embed de error de privilegios
            const noPrivilegesEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`);

            //No continúa si el rol no está autorizado
            if (commandConfig.whitelistedRoles.length > 0) { //Si la lista blanca contiene entradas
                let authorized;

                //Para cada ID de rol de la lista blanca
                for (let i = 0; i < commandConfig.whitelistedRoles.length; i++) {

                    //Si se permite a todo el mundo, el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (commandConfig.whitelistedRoles[i] === 'everyone' || message.author.id === message.guild.ownerID || message.author.id === client.config.guild.botManagerRole || message.author.id === client.config.guild.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.whitelistedRoles[i])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no se permitió la ejecución, manda un mensaje de error
                if (!authorized) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});
            } else if (commandConfig.blacklistedRoles.length > 0) { //Si la lista negra contiene entradas

                //Para cada ID de rol de la lista negra
                for (let i = 0; i < commandConfig.blacklistedRoles.length; i++) {

                    //Si no se permite a todo el mundo y el que invocó el comando no es el dueño, entonces deniega la ejecución
                    if (commandConfig.blacklistedRoles[i] === 'everyone' && message.author.id !== message.guild.ownerID) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});

                    //Si uno de los roles del miembno coincide con la lista negra, entonces deniega la ejecución
                    if (message.member.roles.cache.find(r => r.id === commandConfig.blacklistedRoles[i])) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});
                };
            } else {
                //Manda un mensaje de error
                if (message.author.id !== message.guild.ownerID) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});
            };

            //Borra el mensaje de invocación si se ha configurado para ello
            if (commandConfig.deleteInvocationCommand) await message.delete();

            //Ejecuta el comando
            require(`../commands/${command}`).run(discord, client, message, args, command, commandConfig);

            //Añade un cooldown
            client.cooldownedUsers.add(message.author.id);
            setTimeout(() => {
                client.cooldownedUsers.delete(message.author.id);
            }, 2000);
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

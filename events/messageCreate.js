exports.run = async (message, client) => {

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (message.author.bot || message.type !== 'DEFAULT') return;

    //Si el mensaje proviene de un MD
    if (message.channel.type === 'DM') {

        //Devuelve si el mensaje no tiene contenido
        if (!message.content) return;

        //Filtra el texto en busca de códigos de invitación
        let detectedInvites = message.content.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s\/]+?(?=\b)/gm);

        //Si se encontraron invitaciones (y no es el owner), se comprueba que no sean de la guild
        if (detectedInvites && message.author.id !== client.homeGuild.ownerId) {
            let legitInvites = 0;

            await client.homeGuild.invites.fetch().then(guildInvites => {

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

                if ((member.joinedTimestamp + client.config.automodFilters.newMemberTimeDelimiter) < Date.now()) {
                    client.db.bans[member.id] = {
                        time: Date.now() + client.config.automodFilters.newSpammerMemberBanDuration
                    };

                    let toDMEmbed = new client.MessageEmbed()
                        .setColor(client.config.colors.secondaryError)
                        .setAuthor({ name: '[EXPULSADO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
                        .setDescription(`<@${member.id}>, has sido expulsado de ${client.homeGuild.name}`)
                        .addField('Moderador', client.user.tag, true)
                        .addField('Razón', 'Spam vía MD', true);

                    await member.send({ embeds: [toDMEmbed] });
                    return await member.kick(`Moderador: ${client.user.id}, Razón: Spam vía MD al bot`);
                } else {
                    let toDMEmbed = new client.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setAuthor({ name: '[BANEADO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
                        .setDescription(`<@${member.id}>, has sido baneado en ${client.homeGuild.name}`)
                        .addField('Moderador', client.user.tag, true)
                        .addField('Razón', 'Spam vía MD', true)
                        .addField('Duración', '14d', true);

                    await member.send({ embeds: [toDMEmbed] });
                    return await client.homeGuild.members.ban(member, {reason: `Moderador: ${client.user.id}, Duración: 14d, Razón: Spam vía MD al bot`});
                };
            };
        };

        //Advierte de que los comandos no funcionan por MD
        if (message.content.startsWith(client.config.main.prefix)) {
            const noDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.information)
                .setDescription(`${client.customEmojis.grayTick} | Por el momento, los comandos de **${client.user.username}** solo están disponibles desde el servidor.`);

            return await message.author.send({ embeds: [noDMEmbed] });
        };

        return;
    };

    //Filtros (auto-moderación)
    const automodFiltering = require('../utils/automodFiltering.js');

    //FILTROS DE AUTO-MODERACIÓN
    (async () => {
        for (var key in client.config.automodFilters) {
            await (async () => {
                if (client.config.automodFilters[key].status) {

                    //Comprueba si el miembro es el propietario de la guild
                    if (message.member.id === message.guild.ownerId) return;

                    //Comprueba si el miembro tiene algún rol permitido
                    const bypassRoles = client.config.automodFilters[key].bypassRoles;
                    const bypassChannels = client.config.automodFilters[key].bypassChannels;

                    if (bypassChannels.includes(message.channel.id)) return;
    
                    for (let i = 0; i < bypassRoles.length; i++) {
                        if (message.member.roles.cache.has(bypassRoles[i])) return;
                    }

                    await automodFiltering[key](message).then(match => {
                        if (match) require('../utils/infractionsHandler.js').run(client, message, message.guild, message.member, client.config.automodFilters[key].reason, client.config.automodFilters[key].action, client.user, message.content);
                    });
                }
            })();
        };
    })();

    //Llama al manejador de leveling
    if (client.config.xp.rewardMessages && !message.content.startsWith(client.config.main.prefix) && !client.config.xp.nonXPChannels.includes(message.channel.id)) return await client.functions.addXP(message.member, message.guild, 'message', message.channel);

    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(client.config.main.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command = `${cmd}.js`;

    if (command.length <= 0) return console.error(`${new Date().toLocaleString()} 》No hubo ningún comando a cargar`);

    // Función para ejecutar el comando
    try {
        //Comprueba si es un comando con prefijo
        if (message.content.startsWith(client.config.main.prefix)) {
            let waitEmbed = new client.MessageEmbed().setColor(client.config.colors.secondaryError).setDescription(`${client.customEmojis.redTick} Debes esperar 2 segundos antes de usar este comando`);
            if (client.cooldownedUsers.has(message.author.id)) return message.channel.send({ embeds: [waitEmbed] }).then(msg => {setTimeout(() => msg.delete(), 1000)});

            //Busca el comando por su nombre o su alias
            const listedCmd = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            if (!listedCmd) return; //Devuelve si no lo encuentra

            //Almacena la configuración del comando
            let commandConfig = client.config.commands[listedCmd.config.name];

            //Devuelve si el comando está deshabilitado
            if (!commandConfig || !commandConfig.enabled) return;

            //Devuelve si el canal no está autorizado
            if (commandConfig.whitelistedChannels.length > 0 && !commandConfig.whitelistedChannels.includes(message.channel.id)) return;
            if (commandConfig.blacklistedChannels.length > 0 && commandConfig.blacklistedChannels.includes(message.channel.id)) return;

            //Comprueba si el miembro tiene permiso para ejecutar el comando
            if (!await client.functions.checkCommandPermission(message, commandConfig)) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación.`)]
            }).then(msg => {setTimeout(() => msg.delete(), 5000)});

            //Borra el mensaje de invocación (tras 3 segundos) si se ha configurado para ello
            if (commandConfig.deleteInvocationCommand) setTimeout(() => message.delete(), 2000);

            //Añade el export de la config al objeto "commandConfig";
            commandConfig.export = listedCmd.config;

            //Ejecuta el comando
            listedCmd.run(client, message, args, listedCmd.config.name, commandConfig);

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

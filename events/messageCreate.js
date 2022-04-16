exports.run = async (message, client, locale) => {

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (message.author.bot || message.type !== 'DEFAULT') return;

    //Carga los scripts para filtrar mensajes
    const automodFiltering = require('../utils/moderation/automodFiltering.js');

    //Por cada uno de los filtros de automoderación
    for (const filter in client.config.automodFilters) {

        //Almacena la configuración del filtro
        const filterCfg = client.config.automodFilters[filter];

        //Lo omite si está desactivado
        if (!filterCfg.status) continue;

        //Si el filtro funciona en MD, es un mensaje directo y su uso está desactivado, omite
        if (message.channel.type === 'DM' && (!filterCfg.hasOwnProperty('onDM') || filterCfg.onDM === false)) continue;

        //Lo omite si el autor del mensaje es el propietario de la guild
        if (message.author.id === client.homeGuild.ownerId) continue;

        //Almacena los canales a los que no afecta
        const bypassChannels = filterCfg.bypassChannels;

        //Lo omite si el canal tiene el filtro desactivado
        if (message.channel && bypassChannels.includes(message.channel.id)) continue;

        //Busca y almacena al miembro en la guild
        const guildMember = await client.functions.fetchMember(client.homeGuild, message.author.id)

        //Almacena los roles a los que no afecta
        const bypassRoles = filterCfg.bypassRoles;

        //Lo omite si algún rol del miembro tiene el filtro desactivado
        for (let index = 0; index < bypassRoles.length; index++) if (guildMember.roles.cache.has(bypassRoles[index])) continue;

        //Ejecuta el filtro
        await automodFiltering[filter](client, message).then(match => {

            //Si se encontró una infracción
            if (match) {

                //Almacena la razón de la infracción
                const reason = message.channel.type === 'DM' ? `${filterCfg.reason} (${locale.filteredDm})` : filterCfg.reason; 
            
                //Ejecuta el manejador de infracciones
                require('../utils/moderation/infractionsHandler.js').run(client, message, guildMember, reason, filterCfg.action, client.user, message.content);
            };
        });
    };

    //Si el mensaje proviene de un MD
    if (message.channel.type === 'DM') {

        //Aborta si el mensaje no tiene contenido
        if (!message.content) return;

        //Si se trata de un comando
        if (message.content.startsWith(client.config.main.prefix)) {

            //Advierte de que los comandos no funcionan por MD y aborta
            return await message.author.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.information)
                .setDescription(`${client.customEmojis.grayTick} | ${client.functions.localeParser(locale.unavailableOnDm, { clientUser: client.user, guildName: client.homeGuild.name })}.`)
            ]});
        };

        //Aborta el resto del script
        return;
    };

    //Aumenta la cantidad de XP del miembro (si procede)
    if (client.config.xp.rewardMessages && !message.content.startsWith(client.config.main.prefix) && !client.config.xp.nonXPChannels.includes(message.channel.id)) return await client.functions.addXP(message.member, 'message', message.channel);

    //Comprueba si el comando contiene el prefijo y un nombre de comando 
    if (!message.content.startsWith(client.config.main.prefix) || message.content.length <= client.config.main.prefix.length) return;

    //Extrae los argumentos del input
    const args = message.content.slice(client.config.main.prefix.length).trim().split(/ +/g);

    //Extrae el nombre del comando
    const command = args.shift().toLowerCase();

    try {

        //Comprueba si el miembro ha respetado la espera mínima entre comandos
        if (client.cooldownedUsers.has(message.author.id)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.cooldown}`)
        ]}).then(msg => {setTimeout(() => msg.delete(), 1000)});

        //Busca el comando por su nombre o su alias
        const pulledCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command));

        //Aborta si no lo encuentra
        if (!pulledCommand) return;

        //Almacena la configuración del comando
        let commandConfig = client.config.commands[pulledCommand.config.name];

        //Aborta si el comando está deshabilitado
        if (!commandConfig || !commandConfig.enabled) return;

        //Aborta si el canal no está autorizado en la lista blanca
        if (commandConfig.whitelistedChannels.length > 0 && !commandConfig.whitelistedChannels.includes(message.channel.id)) return;

        //Aborta si el canal está bloqueado por la lista negra
        if (commandConfig.blacklistedChannels.length > 0 && commandConfig.blacklistedChannels.includes(message.channel.id)) return;

        //Comprueba si el miembro tiene permiso para ejecutar el comando
        if (!await client.functions.checkCommandPermission(message, commandConfig)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.nonPrivileged, { messageAuthor: message.author })}.`)]
        }).then(msg => { setTimeout(() => msg.delete(), 5000) });

        //Borra el mensaje de invocación (tras 3 segundos) si se ha configurado para ello
        if (commandConfig.deleteInvocationCommand) setTimeout(() => message.delete(), 2000);

        //Añade el export de la config al objeto "commandConfig";
        commandConfig.export = pulledCommand.config;

        //Almacena las traducciones del comando al idioma configurado
        const commandLocale = await require(`../resources/locales/${client.config.main.language}.json`).commands[pulledCommand.config.category][pulledCommand.config.name];

        //Ejecuta el comando
        pulledCommand.run(client, message, args, command, commandConfig, commandLocale);

        //Añade un cooldown para el miembro
        client.cooldownedUsers.set(message.author.id);

        //Elimina el cooldown pasado el tiempo configurado
        setTimeout(() => { client.cooldownedUsers.delete(message.author.id); }, client.config.main.commandCooldown);
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

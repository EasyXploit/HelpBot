exports.run = async (message, client) => {

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

        //Lo omite si el canal tiene el filtro desactivado
        const bypassChannels = filterCfg.bypassChannels;
        if (message.channel && bypassChannels.includes(message.channel.id)) continue;

        //Busca y almacena al miembro en la guild
        const guildMember = await client.functions.fetchMember(client.homeGuild, message.author.id)

        //Lo omite si algún rol del miembro tiene el filtro desactivado
        const bypassRoles = filterCfg.bypassRoles;
        for (let index = 0; index < bypassRoles.length; index++) if (guildMember.roles.cache.has(bypassRoles[index])) continue;

        //Ejecuta el filtro
        await automodFiltering[filter](client, message).then(match => {

            //Si se encontró una infracción
            if (match) {

                //Almacena la razón de la infracción
                const reason = message.channel.type === 'DM' ? `${filterCfg.reason} (vía MD)` : filterCfg.reason; 
            
                //Ejecuta el manejador de infracciones
                require('../utils/moderation/infractionsHandler.js').run(client, message, guildMember, reason, filterCfg.action, client.user, message.content);
            };
        });
    };

    //Si el mensaje proviene de un MD
    if (message.channel.type === 'DM') {

        //Devuelve si el mensaje no tiene contenido
        if (!message.content) return;

        //Si se trata de un comando
        if (message.content.startsWith(client.config.main.prefix)) {

            //Advierte de que los comandos no funcionan por MD
            return await message.author.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.information)
                .setDescription(`${client.customEmojis.grayTick} | Los comandos de ${client.user} solo están disponibles desde ${client.homeGuild.name}.`)
            ]});
        };

        //Aborta el resto del script
        return;
    };

    //Llama al manejador de leveling
    if (client.config.xp.rewardMessages && !message.content.startsWith(client.config.main.prefix) && !client.config.xp.nonXPChannels.includes(message.channel.id)) return await client.functions.addXP(message.member, message.guild, 'message', message.channel);

    // Función para eliminar el prefijo, extraer el comando y sus argumentos (en caso de tenerlos)
    const args = message.content.slice(client.config.main.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const command = `${cmd}.js`;

    if (command.length <= 0) return console.warn(`${new Date().toLocaleString()} 》AVISO: No hubo ningún comando a cargar.`);

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
            }).then(msg => { setTimeout(() => msg.delete(), 5000) });

            //Borra el mensaje de invocación (tras 3 segundos) si se ha configurado para ello
            if (commandConfig.deleteInvocationCommand) setTimeout(() => message.delete(), 2000);

            //Añade el export de la config al objeto "commandConfig";
            commandConfig.export = listedCmd.config;

            //Ejecuta el comando
            listedCmd.run(client, message, args, listedCmd.config.name, commandConfig);

            //Añade un cooldown
            client.cooldownedUsers.set(message.author.id);
            setTimeout(() => {
                client.cooldownedUsers.delete(message.author.id);
            }, 2000);
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

exports.run = async (message, client, locale) => {

    //Aborta si no es un evento de la guild registrada
    if (message.guild && message.guild.id !== client.homeGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (message.author.bot || message.type !== 'DEFAULT') return;

    //Carga los scripts para filtrar mensajes
    const automodFiltering = require('../../utils/moderation/automodFiltering.js');

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
        const guildMember = await client.functions.fetchMember(message.author.id)

        //Almacena los roles a los que no afecta
        const bypassRoles = filterCfg.bypassRoles;

        //Lo omite si algún rol del miembro tiene el filtro desactivado
        for (let index = 0; index < bypassRoles.length; index++) if (guildMember.roles.cache.has(bypassRoles[index])) continue;

        //Ejecuta el filtro
        await automodFiltering[filter](client, message).then(async match => {

            //Si se encontró una infracción
            if (match) {

                //Almacena la razón de la infracción
                const reason = message.channel.type === 'DM' ? `${filterCfg.reason} (${locale.filteredDm})` : filterCfg.reason; 
            
                //Ejecuta el manejador de infracciones
                require('../../utils/moderation/infractionsHandler.js').run(client, guildMember, reason, filterCfg.action, client.user, message, null, message.channel);
            };
        });
    };

    //Aumenta la cantidad de XP del miembro (si procede)
    if (message.channel.type !== 'DM' && client.config.xp.rewardMessages && !client.config.xp.nonXPChannels.includes(message.channel.id)) await client.functions.addXP(message.member, 'message', message.channel);
};

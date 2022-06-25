exports.run = async (oldMessage, newMessage, client, locale) => {

    //Aborta si no es un evento de la guild registrada
    if (newMessage.guild && newMessage.guild.id !== client.homeGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (newMessage.author.bot || newMessage.type !== 'DEFAULT') return;

    //Aborta si no se modificó el contenido del mensaje
    if(oldMessage.content === newMessage.content) return;

    //Carga los scripts para filtrar mensajes
    const automodFiltering = require('../utils/moderation/automodFiltering.js');

    //Por cada uno de los filtros de automoderación
    for (const filter in client.config.automodFilters) {

        //Almacena la configuración del filtro
        const filterCfg = client.config.automodFilters[filter];

        //Lo omite si está desactivado
        if (!filterCfg.status) continue;

        //Si el filtro funciona en MD, es un mensaje directo y su uso está desactivado, omite
        if (newMessage.channel.type === 'DM' && (!filterCfg.hasOwnProperty('onDM') || filterCfg.onDM === false)) continue;

        //Lo omite si el autor del mensaje es el propietario de la guild
        if (newMessage.author.id === client.homeGuild.ownerId) continue;

        //Almacena los canales a los que no afecta
        const bypassChannels = filterCfg.bypassChannels;

        //Lo omite si el canal tiene el filtro desactivado
        if (newMessage.channel && bypassChannels.includes(newMessage.channel.id)) continue;

        //Busca y almacena al miembro en la guild
        const guildMember = await client.functions.fetchMember(newMessage.author.id)

        //Almacena los roles a los que no afecta
        const bypassRoles = filterCfg.bypassRoles;

        //Lo omite si algún rol del miembro tiene el filtro desactivado
        for (let index = 0; index < bypassRoles.length; index++) if (guildMember.roles.cache.has(bypassRoles[index])) continue;

        //Ejecuta el filtro
        await automodFiltering[filter](client, newMessage).then(async match => {

            //Si se encontró una infracción
            if (match) {

                //Almacena la razón de la infracción
                const reason = newMessage.channel.type === 'DM' ? `${filterCfg.reason} (${locale.filteredDm})` : filterCfg.reason; 
            
                //Ejecuta el manejador de infracciones
                require('../utils/moderation/infractionsHandler.js').run(client, guildMember, reason, filterCfg.action, client.user, newMessage, null, newMessage.channel);
            };
        });
    };
};

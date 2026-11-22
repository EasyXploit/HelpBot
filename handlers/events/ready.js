exports.run = async (event,locale) => {

    try {

        //Carga el ID de la guild base
        const homeGuildId = client.config.dynamic.homeGuild;

        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Si el bot no está en ninguna guild
        if (cachedGuilds.size === 0) {

            //Notifica que el bot está esperando a que sea unido a una guild
            return console.warn(`\n${new Date().toLocaleString()} 》${locale.waitingGuild}.`);
        };

        //Busca la guild base configurada o, si el bot no está en ella, la única guild en la que esté
        const homeGuild = cachedGuilds.get(homeGuildId) || (cachedGuilds.size === 1 ? cachedGuilds.first() : null);

        //Si el bot está en varias guilds y ninguna es la guild base
        if (!homeGuild) {

            //Notifica que el bot no sabe qué guild usar, y espera a que se configure la guild base o a que solo quede una (ver evento "guildDelete")
            return console.warn(`\n${new Date().toLocaleString()} 》${locale.chooseGuild.replace('{{guilds}}', cachedGuilds.map(guild => `"${guild.name}" (${guild.id})`).join(', '))}.`);
        };

        //Almacena el resto de guilds en las que está el bot, aparte de la base
        const otherGuilds = cachedGuilds.filter(guild => guild.id !== homeGuild.id);

        //Si el bot está en más guilds aparte de la base, notifica que solo funcionará en la guild base y que abandonará el resto
        if (otherGuilds.size > 0) console.warn(`\n${new Date().toLocaleString()} 》${locale.justOneGuild.replace('{{homeGuild}}', `"${homeGuild.name}"`).replace('{{otherGuilds}}', otherGuilds.map(guild => `"${guild.name}"`).join(', '))}.`);

        //Comprueba si la guild base ya está almacenada o no
        if (homeGuild.id !== homeGuildId) {

            //Almacena la nueva configuración
            await require('../../lifecycle/newGuild.js').run(homeGuild);

        } else {

            //Carga la config. en memoria y arranca el sistema
            await require('../../lifecycle/loadSystem.js').run(client.locale.lifecycle.loadSystem);
        };

        //Abandona el resto de guilds (una vez cargado el sistema, ya que el evento "guildDelete" lo necesita), ya que el usuario puede no estar en ellas para expulsar al bot
        for (const guild of otherGuilds.values()) await guild.leave().catch(error => console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack));

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};

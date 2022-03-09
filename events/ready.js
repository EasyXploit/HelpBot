exports.run = async (event, client) => {
    try {
        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Almacena los IDs de las guilds alcanzables
        const guildsIDs = cachedGuilds.map(guild => guild.id);
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size === 1) { //Si solo está unido a una guild (comportamiento adecuado)

            //Borra todas las configuraciones y bases de datos en el caso de que no cuadren
            if (client.config.main.homeGuild && !guildsIDs.includes(client.config.main.homeGuild)) await require('../utils/eraseConfig.js').run(client)
            
            //Almacena la nueva configuración de la guild si no hay
            if (!client.config.main.homeGuild) await require('../utils/storeNewGuildConfig.js').run(client, cachedGuilds.first());

            //Cargar config. en memoria + arranque del sistema completo
            await require('../utils/systemLoad.js').run(client);

        } else if (cachedGuilds.size > 1) { //Si está unido a más de una guild

            //Lanza una advertencia por consola
            console.log(`\n 》${client.user.username} no está diseñado para funcionar en más de un servidor.`);

            //Comprueba si una de las guilds está configurada
            if (client.config.main.homeGuild && guildsIDs.includes(client.config.main.homeGuild)) {

                //Sale de las guilds que no están configuradas
                cachedGuilds.forEach(async guild => {
                    if (guild.id !== client.config.main.homeGuild) await guild.leave();
                });

                //Cargar config. en memoria + arranque del sistema completo
                await require('../utils/systemLoad.js').run(client);

            } else {

                //Sale de todas las guilds
                cachedGuilds.forEach(async guild => {
                    await guild.leave();
                });

                //Borra todas las configuraciones y bases de datos
                await require('../utils/eraseConfig.js').run(client);

                //Espera a la ejecución del evento "guildCreate" para el arranque completo del sistema
                console.log(`\n 》${client.user.username} está a la espera de ser añadido a un servidor ...`);
            };
        } else {  //Si no está unido a ninguna una guild

            //Espera a la ejecución del evento "guildCreate" para el arranque completo del sistema
            console.log(`\n 》${client.user.username} está a la espera de ser añadido a un servidor ...`);
        };
    } catch (error) {
        return console.error(`${new Date().toLocaleString()} 》${error.stack}`);
    };
};

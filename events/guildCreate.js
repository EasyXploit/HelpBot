exports.run = async (guild, client) => {
    
    try {

        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;

        //Almacena los IDs de las guilds alcanzables
        const guildsIDs = cachedGuilds.map(guild => guild.id);
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size === 1) {

            //Comprueba si la guild está configurada
            if (!client.config.guild.homeGuild || !guildsIDs.includes(client.config.guild.homeGuild)) {
                
                //Borra todas las configuraciones y bases de datos de la anterior guild (si la hubiera)
                if (client.config.guild.homeGuild) await require('../utils/eraseConfig.js').run(client);

                //Almacena la nueva configuración de la guild
                await require('../utils/storeNewGuildConfig.js').run(client, cachedGuilds.first());
            };

            //Cargar config. en memoria + arranque del sistema completo
            await require('../utils/systemLoad.js').run(client);

        } else {

            //Lanza una advertencia por consola
            console.log(`\n 》${client.user.username} no está diseñado para funcionar en más de un servidor.`);

            //Abandona la guild
            await guild.leave();
        };
    } catch (error) {
        console.log(`${new Date().toLocaleString()} 》${e.stack}`);
    };
};

exports.run = async (guild, client) => {
    
    try {

        //Listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Comprueba cuantas guilds hay disponibles
        if (cachedGuilds.size === 1) {

            //Almacena la nueva configuración de la guild
            await require('../utils/storeNewGuildConfig.js').run(client, cachedGuilds.first());

            //Notifica por consola que el bot se ha unido a la guild
            console.log(`${new Date().toLocaleString()} 》${client.user.username} se ha unido a la guild "${guild.name}".`);

        } else {

            //Lanza una advertencia por consola
            console.warn(`${new Date().toLocaleString()} 》AVISO: ${client.user.username} no está diseñado para funcionar en más de un servidor.`);

            //Abandona la guild
            await guild.leave();
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};

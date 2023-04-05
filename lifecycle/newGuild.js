exports.run = async (client, guild) => {

    try {

        //Reestablece algunas variables de config. globales
        const baseGuild = await client.functions.db.setConfig.run('system.baseGuildId', guild.id);
        await client.functions.db.setConfig.run('system.inviteCode', '');

        //Carga de guild base en memoria
        client.baseGuild = await client.guilds.cache.get(baseGuild);
        
        //Carga la config. en memoria y arranca el sistema
        await require('./loadSystem.js').run(client, client.locale.lifecycle.loadSystem);

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

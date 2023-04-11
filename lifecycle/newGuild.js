module.exports = async (guild) => {

    try {

        //Reestablece algunas variables de config. globales
        const baseGuildId = await client.functions.db.setConfig('system.baseGuildId', guild.id);
        await client.functions.db.setConfig('system.inviteCode', '');

        //Carga de guild base en memoria
        client.baseGuild = await client.guilds.cache.get(baseGuildId);
        
        //Carga la config. en memoria y arranca el sistema
        await require('./loadSystem.js')(client.locale.lifecycle.loadSystem);

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

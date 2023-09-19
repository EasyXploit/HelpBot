//Importa el cargador de sistema
import { loadSystem } from 'helpbot/loaders';

//Exporta una función para cargar una nueva guild base
export async function newBaseGuild(guild) {

    try {

        //Reestablece algunas variables de configuración globales
        const baseGuildId = await client.functions.db.setConfig('system.baseGuildId', guild.id);
        await client.functions.db.setConfig('system.inviteCode', '');

        //Carga de guild base en memoria
        client.baseGuild = await client.guilds.cache.get(baseGuildId);
        
        //Carga la configuración en memoria y arranca el sistema
        await loadSystem(client.locale.lib.loaders.system);

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
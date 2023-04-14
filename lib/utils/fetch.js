//Función para buscar miembros
export default async (mode, target, channel, fetchCache) => {

    try {

        //Almacena el resultado
        let result;

        //En función del modo seleccionado
        switch (mode) {

            //Si se desea buscar un miembro
            case 'member':

                //Comprueba si el parámetro coincide con el formato de mención de miembro
                const memberMatches = target.toString().match(new RegExp(/^<@!?(\d+)>$/));

                //Almacena la caché de los miembros de la guild
                if (!fetchCache) fetchCache = await client.baseGuild.members.fetch();

                //Lo busca por ID o por mención (en función de la variable "memberMatches")
                if (memberMatches) result = fetchCache.find(member => member.id === memberMatches[1]);
                else if (!isNaN(target)) result = fetchCache.find(member => member.id === target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un usuario
            case 'user':

                //Comprueba si el parámetro coincide con el formato de mención de usuario
                const userMatches = target.toString().match(new RegExp(/^<@!?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "userMatches")
                if (userMatches) result = fetchCache ? fetchCache : await client.users.fetch(userMatches[1]);
                else if (!isNaN(target)) result = fetchCache ? fetchCache : await client.users.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un rol
            case 'role':

                //Comprueba si el parámetro coincide con el formato de mención de rol
                const roleMatches = target.toString().match(new RegExp(/^<@&?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "roleMatches")
                if (roleMatches) result = fetchCache ? fetchCache : await client.baseGuild.roles.fetch(roleMatches[1]);
                else if (!isNaN(target)) result = fetchCache ? fetchCache : await client.baseGuild.roles.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un canal
            case 'channel':

                //Comprueba si el parámetro coincide con el formato de mención de canal
                const channelMatches = target.toString().match(new RegExp(/^<#?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "channelMatches")
                if (channelMatches) result = fetchCache ? fetchCache : await client.baseGuild.channels.fetch(channelMatches[1]);
                else if (!isNaN(target)) result = fetchCache ? fetchCache : await client.baseGuild.channels.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un mensaje
            case 'message':

                //Si se proporcionó un canal
                if (channel) {

                    //Busca dicho canal en la guild
                    const fetchedChannel = fetchCache ? fetchCache : await client.functions.utils.fetch('channel', channel);

                    //Si hubo canal, busca dicho mensaje en el canal
                    if (fetchedChannel && !isNaN(target)) result = fetchCache ? fetchCache : await fetchedChannel.messages.fetch(target);

                } else {

                    //Almacena los canales de la guild
                    const guildChannels = fetchCache ? fetchCache : await client.baseGuild.channels.fetch();

                    //Itera entre todos los canales de la guild
                    for (const channelId of guildChannels) {

                        //Almacena el canal iterado
                        const iteratedChannel = await guildChannels.get(channelId[0]);

                        try {

                            //Busca el mensaje en el canal de la iteración actual
                            const fetchedMessage = fetchCache ? fetchCache : await iteratedChannel.messages.fetch(target);

                            //Si encontró el mensaje, lo devuelve
                            if (fetchedMessage) return result = fetchedMessage;

                        } catch (error) { 

                            //Si no se encontró el mensaje en este canal, continua con el siguiente
                            if (error.toString().includes('Unknown Message')) continue;
                        };
                    };
                };
                
                //Para el switch
                break;
        };

        //Si hubo resultado (y era váido), lo devuelve
        if (result && typeof result !== 'undefined') return result;

    } catch (error) {

        //Devuelve "falso"
        return false;
    };
};

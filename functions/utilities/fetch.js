//Función para buscar miembros
exports.run = async (client, mode, target, channel) => {

    try {

        //Almacena el resultado
        let result;

        //En función del modo seleccionado
        switch (mode) {

            //Si se desea buscar un miembro
            case 'member':

                //Comprueba si el parámetro coincide con el formato de mención de miembro
                const memberMatches = target.toString().match(new RegExp(/^<@!?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "memberMatches")
                if (memberMatches) result = await client.homeGuild.members.fetch(memberMatches[1]);
                else if (!isNaN(target)) result = await client.homeGuild.members.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un usuario
            case 'user':

                //Comprueba si el parámetro coincide con el formato de mención de usuario
                const userMatches = target.toString().match(new RegExp(/^<@!?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "userMatches")
                if (userMatches) result = await client.users.fetch(userMatches[1]);
                else if (!isNaN(target)) result = await client.users.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un rol
            case 'role':

                //Comprueba si el parámetro coincide con el formato de mención de rol
                const roleMatches = target.toString().match(new RegExp(/^<@&?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "roleMatches")
                if (roleMatches) result = await client.homeGuild.roles.fetch(roleMatches[1]);
                else if (!isNaN(target)) result = await client.homeGuild.roles.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un canal
            case 'channel':

                //Comprueba si el parámetro coincide con el formato de mención de canal
                const channelMatches = target.toString().match(new RegExp(/^<#?(\d+)>$/));

                //Lo busca por ID o por mención (en función de la variable "channelMatches")
                if (channelMatches) result = await client.homeGuild.channels.fetch(channelMatches[1]);
                else if (!isNaN(target)) result = await client.homeGuild.channels.fetch(target);
                
                //Para el switch
                break;
        
            //Si se desea buscar un mensaje
            case 'message':

                //Si se proporcionó un canal
                if (channel) {

                    //Busca dicho canal en la guild
                    const fetchedChannel = await client.functions.utilities.fetch.run(client, 'channel', channel);

                    //Si hubo canal, busca dicho mensaje en el canal
                    if (fetchedChannel && !isNaN(target)) result = await fetchedChannel.messages.fetch(target);

                } else {

                    //Almacena los canales de la guild
                    const guildChannels = await client.homeGuild.channels.fetch();

                    //Itera entre todos los canales de la guild
                    for (const channelId of guildChannels) {

                        //Almacena el canal iterado
                        const iteratedChannel = await guildChannels.get(channelId[0]);

                        try {

                            //Busca el mensaje en el canal de la iteración actual
                            const fetchedMessage = await iteratedChannel.messages.fetch(target);

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
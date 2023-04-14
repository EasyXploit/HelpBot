//Función para reemplazar comodines en las cadenas de texto
export default async (string) => {

    try {

        //Almacena los placeholders detectados
        const placeHolders = string.match(/{{\s?([^{}\s]*)\s?}}/g);

        //Si se encontraron placeholders
        if (placeHolders !== null) {

            //Crea un objeto para almacenar los valores interpretados
            let wildcards = {};

            //Por cada uno de los placeholders
            for (let placeHolder of placeHolders) {

                //Elimina los delimitadores del placeholder
                placeHolder = placeHolder.replace('{{', '').replace('}}', '');
                
                //En función del tipo de placeholder
                switch (placeHolder) {

                    //Si es para el nombre del servidor
                    case 'guildName':

                        //Almacena el nombre la guild
                        wildcards[placeHolder] = client.baseGuild.name;
                        
                        //Para el switch
                        break;

                    //Si es para el conteo de miembros
                    case 'memberCount':

                        //Calcula la cantidad de miembros de la guild
                        const guildMembers = await client.baseGuild.members.fetch();

                        //Almacena la cantidad de miembros de la guild
                        wildcards[placeHolder] = guildMembers.size;
                        
                        //Para el switch
                        break;

                    //Omite si se proporcionó un placeholder inválido
                    default: break;
                };
            };

            //Cambia los placeholders por sus valores reales
            return await client.functions.utils.parseLocale(string, wildcards);
        };

        //Devuelve la cadena sin modificar
        return string;

    } catch (error) {

        //Muestra un error por consola
        logger.error(error.stack);

        //Devuelve un estado erróneo
        return false;
    };
};

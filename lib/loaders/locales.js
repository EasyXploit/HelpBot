//Exporta una función para precargar el idioma del bot
export async function loadLocales(desiredLocaleName) {

    //Almacena las traducciones al idioma por defecto
    const defaultLocale = JSON.parse(fs.readFileSync('./locales/en-US.json'));

    //Almacena las traducciones al idioma configurado
    const desiredLocale = JSON.parse(fs.readFileSync(`./locales/${desiredLocaleName}.json`));

    //Si el idioma por defecto es el mismo que el deseado, devuelve este mismo
    if (desiredLocaleName.toLowerCase() === 'en-us') return desiredLocale;

    //Función para fusionar objetos que difieren
    function mergeObject(object1, object2) {

        //Por cada una de las claves del objeto 1
        Object.keys(object1).forEach(key => {

            //Si la clave contiene un objeto
            if (typeof object1[key] === 'object') {

                //Si la clave no existe en el segundo objeto, se la añade
                if (!object2.hasOwnProperty(key)) object2[key] = object1[key];

                //Sino, baja un nivel y vuelve a invocar esta función
                else mergeObject(object1[key], object2[key]);

            } else {

                //Si la clave no existe en el segundo objeto
                if (!object2.hasOwnProperty(key)) {

                    //La añade
                    object2[key] = object1[key];

                } else {

                    //Si existe y su valor tiene un comodín
                    if (object1[key].includes('{{') && object1[key].includes('}}')) {

                        //Almacena el nombre del comodín
                        const wildcardName = object1[key].match(/{{(\w+)}}/)[1];

                        //Si el segundo objeto no tiene el comodín
                        if (!object2[key].includes(`{{${wildcardName}}}`)) {

                            //Reemplaza el valor del segundo objeto con el valor del primero
                            object2[key] = object1[key];
                        };
                    };
                };
            };
        });

        //Por cada una de las claves del objeto 2
        Object.keys(object2).forEach(key => {

            //Si la clave no existe en el primer objeto, la borra del segundo
            if (!object1.hasOwnProperty(key)) delete object2[key];
        });
      
        //Por cada una de las claves del objeto 1, si su valor incluye un comodín (y no es un objeto)
        Object.keys(object2).filter(key => typeof object2[key] === 'string' && object2[key].includes('{{')).forEach(key => {

            //Si el valor tiene un comodín
            if (object2[key].includes('{{') && object2[key].includes('}}')) {

                //Almacena el nombre del comodín
                const wildcardName = object2[key].match(/{{(\w+)}}/)[1];

                //Si el primer objeto no tiene el comodín
                if (!object1[key].includes(`{{${wildcardName}}}`)) {

                    //Reemplaza el valor del segundo objeto con el valor del primero
                    object2[key] = object1[key];
                };
            };
        });
      
        //Devuelve el objeto resultante
        return object2;
    };
    
    //Fusiona las traducciones en una sola
    const mergedLocale = mergeObject(defaultLocale, desiredLocale);

    //Devuelve las nuevas traducciones
    return mergedLocale;
};

//Función para eliminar claves indefinidas o nulas de un array de objetos
const isArrOfObjNil = async (array, lodash) => {

    //Requiere "lodash" para comparar objetos
    lodash ? lodash : require('lodash');

    //Almacena un array para los objetos modificadoss
    let cleanArray = [];

    //Por cada uno de los objetos del array
    for (let object of array) {

        //Por cada una de las propiedades del objeto iterado
        for (let property in object) {

            //Si la propiedad es un array y tienes valores
            if (Array.isArray(object[property]) && object[property].length > 0) {
                
                //Ejecuta esta misma función de manera recursiva sobre dicho array
                object[property] = await isArrOfObjNil(object[property], lodash);
            }
        };

        //Elimina las claves nulas o indefinidas de la propiedad y la sube al array de objetos modificados
        cleanArray.push(lodash.omitBy(object, lodash.isNil));
    };

    //Devuelve el nuevo array
    return cleanArray;
};

//Exporta la función
module.exports = isArrOfObjNil;

//Función para 
export default (string) => {

    //Convierte el string a minúscula y lo separa por guiones en un array
    let wordsArray = string.toLowerCase().split('_');

    //Obtiene el resultado mediante un mapa
    let returnString = wordsArray.map((word) => {

        //Devuelve cada palabra con la primera letra en mayúsculas
        return word.charAt(0).toUpperCase() + word.slice(1);

    }).join(' ');

    //Devuelve el resultado
    return returnString;
};
  
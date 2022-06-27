//Función para convertir de HH:MM:SS a MS
exports.run = async HHMMSS => {

    //Divide en un array mediante la separación de :
    const splittedTime = HHMMSS.split(':');

    //Añade los campos restantes
    while (splittedTime.length !== 3) splittedTime.splice(0, 0, parseInt('00'));

    //Transforma la cadena a segundos.
    const seconds = ( + splittedTime[0] ) * 60 * 60 + ( + splittedTime[1] ) * 60 + ( + splittedTime[2] ); 

    //Devuelve el resultado en MS
    return seconds * 1000;
};
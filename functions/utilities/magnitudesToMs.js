//Función para convertir magnitudes a milisegundos
exports.run = async duration => {

    //Almacena el resultado
    let result = 0;

    //Función para separar partes de magnitudes y calcular milisegundos 
    async function parseMillis(magnitude) {

        //Obtiene la magnitud de tiempo
        const time = magnitude.slice(0, -1);

        //Obtiene la unidad de medida
        const measure = magnitude.slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número
        if (isNaN(time)) return false;

        //Comprueba si se ha proporcionado una unidad de medida válida
        if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return false;

        //Almacena los milisegundos resultantes
        let milliseconds;

        //Transforma a milisegundos según la medida
        switch (measure) {
            case 's': milliseconds = time * 1000;       break;
            case 'm': milliseconds = time * 60000;      break;
            case 'h': milliseconds = time * 3600000;    break;
            case 'd': milliseconds = time * 86400000;   break;
        };

        //Devuelve el resultado
        return milliseconds;
    };

    //Comprueba si se ha proporcionado un array o no
    if (Array.isArray(duration)) {
        
        //Por cada parámetro del array
        for (const parameter of duration) {

            //Lo convierte a milisegundos
            const parsedMillis = await parseMillis(parameter);

            //Si se obtuvo un resultado, lo suma
            if (parsedMillis) result += parsedMillis;
        };

    } else {

        //Lo convierte a milisegundos
        const parsedMillis = await parseMillis(duration);

        //Si se obtuvo un resultado, lo suma
        if (parsedMillis) result += parsedMillis;
    };

    //Si se calculó un resultado, lo devuelve
    if (result > 0) return result;
};
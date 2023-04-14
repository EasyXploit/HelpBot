//Función para generar números enteros aleatorios dentro de un rango
export default async (min, max) => {

    //Redondea a la baja el mínimo
    min = Math.ceil(min);

    //Redondea al alza el máximo
    max = Math.floor(max);

    //Devuelve un entero aleatorio entre min y max
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
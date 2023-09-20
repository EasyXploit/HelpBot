//Función para generar sIds
export default async (length) => {
        
    //Requiere el generador de Id's con un alfabeto personalizado
    const { customAlphabet } = await import('nanoid');

    //Asigna el alfabeto y la longitud del Id
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10);

    //Devuelve el sID generado
    return nanoid();
};
//Función para generar sIDs
export async function run(length) {
        
    //Requiere el generador de IDs con un alfabeto personalizado
    const { customAlphabet } = await import('nanoid');

    //Asigna el alfabeto y la longitud del ID
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10);

    //Devuelve el sID generado
    return nanoid();
};
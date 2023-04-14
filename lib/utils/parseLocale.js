//Función para reemplazar comodines en las traducciones
export default async (expression, valuesObject) => {

    //Almacena el texto, con los comodines de la expresión reemplazados
    const text = expression.replace(new RegExp(/{{\s?([^{}\s]*)\s?}}/g), (substring, value, index) => {

        //Almacena el valor reemplazado
        value = valuesObject[value];

        //Devuelve el valor
        return value;
    });

    //Devuelve el texto reemplazado
    return text;
};
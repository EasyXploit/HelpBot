//Función para formatear bytes en unidades más grandes
exports.run = async (bytes, decimals = 2) => {

    //Respuesta por defecto
    if (bytes === 0) return '0 Bytes';

    //Almacena los decimales
    const fixedDecimals = decimals < 0 ? 0 : decimals;

    //Almacena las unidades de medida
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    //Calcula el el tipo de unidad a emplear
    const choosenUnit = Math.floor(Math.log(bytes) / Math.log(1024));

    //Devuelve el resultado formateado
    return `${parseFloat((bytes / Math.pow(1024, choosenUnit)).toFixed(fixedDecimals))} ${sizes[choosenUnit]}`;
};
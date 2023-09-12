//Función para convertir de MS a tiempo formateado
export default async (ms) => {

    //Almacena las traducciones
    const locale = client.locale.lib.utils.msToTime;

    //Convierte los MS a segundos
    let seconds = parseInt(ms / 1000);

    //Extrae los años
    const years = parseInt(Math.floor(seconds / 31536000));
    seconds = seconds % 31536000;

    //Extrae los meses
    const months = parseInt(Math.floor(seconds / 2629800));
    seconds = seconds % 2629800;

    //Extrae los dias
    const days = parseInt(seconds / 86400);
    seconds = seconds % 86400;

    //Extrae las horas
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;

    //Extrae los minutos
    const minutes =  parseInt(seconds / 60);

    //Se queda solo con los segundos NO extraidos a los minutos
    seconds = parseInt(seconds % 60);

    //Muestra ceros de relleno si fuera necesario
    const hoursStr = ('00' + hours).slice(-2);
    const minutesStr = ('00' + minutes).slice(-2);
    const secondsStr = ('00' + seconds).slice(-2);

    //Devuelve el resultado
    return `${years > 0 ? `${years} ${locale.years}, ` : ''}${months > 0 ? `${months} ${locale.months}, ` : ''}${days > 0 ? `${days} ${locale.days}, ` : ''}${hoursStr}:${minutesStr}:${secondsStr}`;
};
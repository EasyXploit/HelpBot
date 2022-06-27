//Función para generar un footer para los embeds musicales
exports.run = async (client, targetGuild) => {

    //Almacena las traducciones
    const locale = client.locale.functions.reproduction.getFooter;

    //Almacena la cola de reproducción de la guild
    const reproductionQueue = client.reproductionQueues[targetGuild.id];

    //Almacena el footer
    let footer = `${locale.mode}: ${reproductionQueue && reproductionQueue.mode ? '' : '▶️'}`;

    //Si hay una cola de reproducción y se ha configurado un modo
    if (reproductionQueue && reproductionQueue.mode) {

        //Cambia el pie de página para agregar el símbolo del modo.
        switch (reproductionQueue.mode) {
            case 'shuffle':     footer += '🔀'; break;
            case 'loopsingle':  footer += '🔂'; break;
            case 'loopqueue':   footer += '🔁'; break;
        };
    };

    //Devuelve el footer
    return footer;
};
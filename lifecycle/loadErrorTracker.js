exports.run = async () => {

    try {

        //Aborta si no hay un DSN configurado
        if (!process.env.SENTRY_DSN || process.env.SENTRY_DSN.length === 0) return;

        //Anuncia la carga del manejador de errores remoto
        logger.debug('Loading remote error tracker ...');

        //Almacena la librería de Sentry
        const sentry = require("@sentry/node");

        //Se importa de @sentry/tracing para parchear el centro global para que funcione el rastreo
        /*const sentryTracing = */require("@sentry/tracing");

        //Inicializa la conexión con Sentry
        sentry.init({
            dsn: process.env.SENTRY_DSN, //Proporciona el DSN (Data Source Name)
            enabled: process.env.NODE_ENV === 'production' ? true : false, //Determina si se ha de recoger muestras o no
            tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE || 1.0  //Proporciona la tasa de recogida de muestras
        });

        //Muestra un mensaje de confirmación en la consola
        logger.debug(`Traces sample rate: ${process.env.NODE_ENV === 'production' ? 1.0 : 0}. Remote error tracker load completed!`);

    } catch (error) {

        //Muestra un mensaje de error en la consola
        logger.error(error.stack);
    };
};

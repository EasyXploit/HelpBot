//Exporta una función para cargar el manejador de errores
export async function loadErrorTracker(localConfig) {

    try {

        //Almacena el DSN de Sentry y la tasa de recogida de muestra, desde .ENV o desde la configuración local
        const sentryDSN = process.env.ERROR_TRACKING_SENTRY_DSN && process.env.ERROR_TRACKING_SENTRY_DSN.length > 0 ? process.env.ERROR_TRACKING_SENTRY_DSN : localConfig.errorTracking.sentryDSN;
        const tracesSampleRate = process.env.ERROR_TRACKING_TRACES_SAMPLE_RATE && process.env.ERROR_TRACKING_TRACES_SAMPLE_RATE.length > 0 ? process.env.ERROR_TRACKING_TRACES_SAMPLE_RATE : localConfig.errorTracking.tracesSampleRate;

        //Aborta si no se proporcionó un DSN
        if (!sentryDSN || sentryDSN.length === 0) return;

        //Anuncia la carga del manejador de errores remoto
        logger.debug('Loading remote error tracker');

        //Aborta y muestra un log si el DSN de Sentry no parece válido
        if (!/^https:\/\/[a-zA-Z0-9]{32}@[a-zA-Z0-9.-]+\.[a-z]{2,6}\/\d+$/.test(sentryDSN)) return logger.warn('A valid Sentry DSN has not been provided, so remote exception tracking will not be enabled');

        //Almacena la librería de Sentry
        const sentry = require("@sentry/node");

        //Se importa de @sentry/tracing para parchear el centro global para que funcione el rastreo
        require("@sentry/tracing");

        //Inicializa la conexión con Sentry
        sentry.init({
            dsn: sentryDSN, //Proporciona el DSN (Data Source Name)
            enabled: process.env.NODE_ENV === 'production' ? true : false, //Determina si se ha de recoger muestras o no
            tracesSampleRate: tracesSampleRate || 1.0  //Proporciona la tasa de recogida de muestras
        });

        //Muestra un mensaje de confirmación en la consola
        logger.debug(`Traces sample rate: ${process.env.NODE_ENV === 'production' ? 1.0 : 0}. Remote error tracker load completed`);

    } catch (error) {

        //Muestra un mensaje de error en la consola
        logger.error(error.stack);
    };
};

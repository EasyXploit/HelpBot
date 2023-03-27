exports.run = async (locale) => {

    try {

        //Anuncia la carga del manejador de errores remoto
        console.log(locale.loading);

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
        console.log(` - ${locale.tracesSampleRate}: ${process.env.NODE_ENV === 'production' ? 1.0 : 0}\n\n${locale.configLoaded}\n`);

    } catch (error) {

        //Muestra un mensaje de error en la consola
        console.error(` - ${locale.error}\n`);
    };
};

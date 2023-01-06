exports.run = async (locale) => {

    //Anuncia la carga del manejador de errores remoto
    console.log(locale.loading);

    //Carga la configuración del manejador de errores remoto
    const config = require('../configs/errorTracker.json').sentry;

    //Almacena la librería de Sentry
    const sentry = require("@sentry/node");

    //Se importa de @sentry/tracing para parchear el centro global para que funcione el rastreo
    /*const sentryTracing = */require("@sentry/tracing");

    //Si no hay DSN configurado, devuelve un error y continua
    if (!config.dsn) return console.error(`${locale.errors.invalidDSN}\n`);

    //Si se trata de un entorno de desarrollo, reemplaza la tasa de recogida de muestras
    if (process.env.NODE_ENV === 'development') config.tracesSampleRate = 0;

    //Si la tasa de recogida de muestras configurada es menor al mínimo
    if (config.tracesSampleRate < 0) {

        //Muestra un advertencia en la consola
        console.warn(locale.errors.smallTracesSampleRate);

        //Reemplaza la tasa de recogida de muestras por un valor válido
        config.tracesSampleRate = 0;
    };

    //Si la tasa de recogida de muestras configurada es mayor al máximo
    if (config.tracesSampleRate > 1.0) {

        //Reemplaza la tasa de recogida de muestras por un valor válido
        console.warn(locale.errors.largeTracesSampleRate);

        //Muestra un advertencia en la consola
        config.tracesSampleRate = 1.0;
    };

    try {

        //Inicializa la conexión con Sentry
        sentry.init({
            
            dsn: config.dsn,                           //Proporciona el DSN (Data Source Name)
            tracesSampleRate: config.tracesSampleRate  //Proporciona la tasa de recogida de muestras
        });

    } catch (error) {
        
        //Si el DSN proporcionado era incorrecto, devuelve un error y continua
        if (error.toString().includes('SentryError: Invalid Sentry Dsn:')) return console.error(`${locale.errors.invalidDSN}\n`);
    }

    //Muestra un mensaje de confirmación en la consola
    console.log(` - ${locale.tracesSampleRate}: ${config.tracesSampleRate}\n\n${locale.configLoaded}\n`);

    return true;
}
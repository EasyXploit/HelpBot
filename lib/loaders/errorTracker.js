// Exports a function to load the error handler
export async function loadErrorTracker(localConfig) {

    try {

        // Stores the Sentry DSN and the traces sample rate, from .env or from the local configuration
        const sentryDSN = process.env.SENTRY_DSN && process.env.SENTRY_DSN.length > 0 ? process.env.SENTRY_DSN : localConfig.errorTracking.sentryDSN;
        const tracesSampleRate = process.env.SENTRY_TRACES_SAMPLE_RATE && process.env.SENTRY_TRACES_SAMPLE_RATE.length > 0 ? process.env.SENTRY_TRACES_SAMPLE_RATE : localConfig.errorTracking.tracesSampleRate;

        // Aborts if a DSN was not provided
        if (!sentryDSN || sentryDSN.length === 0) return;

        // Announces the load of the remote errors handler
        logger.debug('Loading remote error tracker');

        // Aborts and shows a log if Sentry's DSN does not seem valid
        if (!/^https:\/\/[a-zA-Z0-9]{32}@[a-zA-Z0-9.-]+\.[a-z]{2,6}\/\d+$/.test(sentryDSN)) return logger.warn('A valid Sentry DSN has not been provided, so remote exception tracking will not be enabled');

        // Stores the Sentry library
        const sentry = require("@sentry/node");

        // It is imported from @Sentry/Tracing to patch the global center for tracking
        require("@sentry/tracing");

        // Initializes the connection with Sentry
        sentry.init({
            dsn: sentryDSN, // Provides the DSN (Data Source Name)
            enabled: process.env.NODE_ENV === 'production' ? true : false, // Determines whether samples have to be collected or not
            tracesSampleRate: tracesSampleRate || 1.0  // Provides the sample collection rate
        });

        // Shows a confirmation message on the console
        logger.debug(`Traces sample rate: ${process.env.NODE_ENV === 'production' ? 1.0 : 0}. Remote error tracker load completed`);

    } catch (error) {

        // Shows an error message in the console
        logger.error(error.stack);
    };
};

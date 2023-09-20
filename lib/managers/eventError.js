// Function to manage errors in events
export default async (error) => {

    // The error in console is shown
    logger.error(error.stack);

    // Sends the exception to the remote error handler
    client.errorTracker.captureException(error);
};
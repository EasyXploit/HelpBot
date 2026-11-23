// Function to shut down the bot gracefully: disconnects it from Discord, closes the database connection and sends any pending errors to the remote error handler, before exiting the process
export default async () => {

    // Disconnects the Discord client, if it was loaded
    try { if (global.client) await client.destroy(); } catch (error) {};

    // Closes the database connection
    try { await require('mongoose').connection.close(); } catch (error) {};

    // Sends any pending errors to the remote error handler
    try { await require('@sentry/node').close(2000); } catch (error) {};

    // Exits the process without error
    process.exit(0);
};

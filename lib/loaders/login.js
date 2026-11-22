// Imports the necessary libraries
import { password } from '@inquirer/prompts';
import { splashLogo } from 'helpbot/loaders';

// Exports a function to log in to Discord
export async function login() {

    // Stores the translations of the bot
    const locale = client.locale.lib.loaders.login;

    // Stores if the token came from .env or not
    const isEnvToken = process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN.length > 0;

    // Obtains the login token from the environment variables or from the database
    let discordToken = isEnvToken ? process.env.DISCORD_TOKEN : await client.functions.db.getConfig('system.discordToken');

    // Function to ask the user for the token
    async function answerToken() {

        // Shows the help to obtain the token
        console.log(`❔ ${await client.functions.utils.parseLocale(locale.provideTokenHelp, { tokenHelpURL: client.functions.utils.docsURL('getting-started.md#create-the-bot-account') })}.\n`);

        // Asks for the token (hiding it), and validates if it is correct
        const discordToken = await password({
            message: `${locale.tokenPrompt}:`,
            mask: true,
            validate: (value) => /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/.test(value.trim()) || `${locale.invalidEnteredToken}.`
        });

        // Returns the token, without spaces at the beginning or the end
        return discordToken.trim();
    };

    // It is verified that a login token has been provided
    if (!discordToken || discordToken.length === 0) {

        // Sends a notice to the console
        logger.warn('There is no token configured in the database or provided using the DISCORD_TOKEN environment variable, so user interaction will be requested to provide it');

        // Cleans the console and shows the logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);

        // Shows through the console the header of the question
        console.log(`🔑 ${locale.provideTokenHeader}.`);

        // Executes the method to ask the token and stores it
        discordToken = await answerToken();

        // Stores the new token in the database, if it came from the database
        if (!isEnvToken) await client.functions.db.setConfig('system.discordToken', discordToken);

        // Stores the new token in .env, if this did not come from the database
        if (isEnvToken) process.env.DISCORD_TOKEN = discordToken;
    };

    // Notifies the client login via console
    logger.debug('Attempting to log in');
    client.login(discordToken)
        .then(() => logger.debug('Logged in successfully'))
        .catch(async (error) => {

            // Sends the error to the console
            logger.error(error.stack);

            // Cleans the console and shows the logo
            process.stdout.write('\u001b[2J\u001b[0;0H');
            await splashLogo(client.locale.lib.loaders.splashLogo);

            // Shows through the console the header of the question
            console.log(`❌ ${locale.invalidProvidedToken}.`);

            // Executes the method to ask the token and stores it
            discordToken = await answerToken();

            // Stores the new token in the database, if it came from the database
            if (!isEnvToken) await client.functions.db.setConfig('system.discordToken', discordToken);

            // Stores the new token in .env, if this did not come from the database
            if (isEnvToken) process.env.DISCORD_TOKEN = discordToken;

            // Cleans the console and shows the logo
            process.stdout.write('\u001b[2J\u001b[0;0H');
            await splashLogo(client.locale.lib.loaders.splashLogo);
        
            // Indicates that the bot is starting
            logger.info(`${client.locale.index.startupMsg} ...`);

            // Calls this function again
            login();
        });
};

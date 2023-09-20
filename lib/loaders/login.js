// Imports the necessary libraries
import inquirer from 'inquirer';
import { splashLogo } from 'helpbot/loaders';

// Help URL to get a token
const tokenHelpURL = 'https://github.com/EasyXploit/HelpBot/wiki/Starting#-creating-an-account-for-the-bot';

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
        console.log(`❔ ${await client.functions.utils.parseLocale(locale.provideTokenHelp, { tokenHelpURL: tokenHelpURL })}.\n`);

        // Generates the token question, and validates if it is correct
        const questions = [
            {
                type: 'password',
                name: 'discordToken',
                mask: true,
                message: `${locale.tokenPrompt}:`,
                validate: async (value) => {
                    return /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/.test(value) || `${locale.invalidEnteredToken}.`;
                },
                filter: (value) => {
                    return value.trim();
                }
            }
        ];

        // Asks for the token
        const answer = await inquirer.prompt(questions);

        // Returns the token
        return answer.discordToken;
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

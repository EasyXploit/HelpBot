//Importa las librerías necesarias
import inquirer from 'inquirer';
import { splashLogo } from 'helpbot/loaders';

//URL de ayuda para obtener un token
const tokenHelpURL = 'https://github.com/EasyXploit/HelpBot/wiki/Starting#-creating-an-account-for-the-bot';

//Exporta una función para iniciar sesión en Discord
export async function login() {

    //Almacena las traducciones del bot
    const locale = client.locale.functions.loaders.login;

    //Almacena si el token venía del .ENV o no
    const isEnvToken = process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN.length > 0;

    //Obtiene el token de inicio de sesión desde las variables de entorno o desde la BBDD
    let discordToken = isEnvToken ? process.env.DISCORD_TOKEN : await client.functions.db.getConfig('system.discordToken');

    //Función para preguntar tokens al usuario
    async function answerToken() {

        //Muestra la ayuda para obtener el token
        console.log(`❔ ${await client.functions.utils.parseLocale(locale.provideTokenHelp, { tokenHelpURL: tokenHelpURL })}.\n`);

        //Genera la pregunta del token, y valida si es correcto
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

        //Pregunta el token
        const answer = await inquirer.prompt(questions);

        //Devuelve el token
        return answer.discordToken;
    };

    //Se comprueba que se haya proporcionado un token de inicio de sesión
    if (!discordToken || discordToken.length === 0) {

        //Manda un aviso a la consola
        logger.warn('There is no token configured in the database or provided using the DISCORD_TOKEN environment variable, so user interaction will be requested to provide it');

        //Limpia la consola y muestra el logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lifecycle.splashLogo);

        //Muestra por consola el header de la pregunta
        console.log(`🔑 ${locale.provideTokenHeader}.`);

        //Ejecuta el método para preguntar el token y lo almacena
        discordToken = await answerToken();

        //Almacena el nuevo token en la BD, si este venía de la BBDD
        if (!isEnvToken) await client.functions.db.setConfig('system.discordToken', discordToken);

        //Almacena el nuevo token en .ENV, si este no venía de la BBDD
        if (isEnvToken) process.env.DISCORD_TOKEN = discordToken;
    };

    //Notifica el inicio de sesión en el cliente por consola
    logger.debug('Attempting to log in');
    client.login(discordToken)
        .then(() => logger.debug('Logged in successfully'))
        .catch(async (error) => {

            //Manda el error a la consola de errores
            logger.error(error.stack);

            //Limpia la consola y muestra el logo
            process.stdout.write('\u001b[2J\u001b[0;0H');
            await splashLogo(client.locale.lifecycle.splashLogo);

            //Muestra por consola el header de la pregunta
            console.log(`❌ ${locale.invalidProvidedToken}.`);

            //Ejecuta el método para preguntar el token y lo almacena
            discordToken = await answerToken();

            //Almacena el nuevo token en la BD, si este venía de la BBDD
            if (!isEnvToken) await client.functions.db.setConfig('system.discordToken', discordToken);

            //Almacena el nuevo token en .ENV, si este no venía de la BBDD
            if (isEnvToken) process.env.DISCORD_TOKEN = discordToken;

            //Limpia la consola y muestra el logo
            process.stdout.write('\u001b[2J\u001b[0;0H');
            await splashLogo(client.locale.lifecycle.splashLogo);
        
            //Indica que el bot se está iniciando
            logger.info(`${client.locale.index.startupMsg} ...`);

            //Vuelve a llamar a esta función
            login();
        });
};

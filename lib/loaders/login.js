//Exporta una función para iniciar sesión en Discord
export async function login() {

    //Obtiene el token de inicio de sesión desde las variables de entorno o desde la BD
    let discordToken = process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN.length > 0 ? process.env.DISCORD_TOKEN : await client.functions.db.getConfig('system.discordToken');

    //Se comprueba que se haya proporcionado un token de inicio de sesión
    if (!discordToken || discordToken.length === 0) {

        //Notifica el error por consola
        logger.error('A Discord login token has not been provided. The program will stop');

        //Aborta el proceso de manera limpia
        process.exit(1);
    };

    //Notifica el inicio de sesión en el cliente por consola
    logger.debug('Attempting to log in');
    client.login(discordToken)
        .then(() => logger.debug('Logged in successfully'))
        .catch(() => logger.error('Login failed. Check if the login token is valid'));
};

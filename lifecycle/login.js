exports.run = async (client, locale) => {

    //Obtiene el token de inicio de sesión desde las variables de entorno o desde la BD
    let discordToken = process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN.length > 0 ? process.env.DISCORD_TOKEN : await client.functions.db.getConfig.run('system.discordToken');

    //Se comprueba que se haya proporcionado un token de inicio de sesión
    if (!discordToken || discordToken.length === 0) {

        //Notifica el error por consola
        console.error(`${locale.tokenNotProvided}.`);

        //Aborta el proceso de manera limpia
        process.exit();
    };

    //Notifica el inicio de sesión en el cliente por consola
    console.log(`\n- ${locale.loggingIn} ...\n`);
    client.login(discordToken)
        .then(() => console.log(`\n - ${locale.loggedIn}.\n`))
        .catch(() => console.error(`\n - ${locale.couldNotLogIn}.\n`));
};

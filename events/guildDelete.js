exports.run = async (guild, client) => {
    
    try {

        //Notifica el abandono de la guild
        console.warn(`${new Date().toLocaleString()} 》AVISO: ${client.user.username} ha abandonado la guild "${guild.name}".`);

        //Carga el listado de guilds a las que el bot está unido
        const cachedGuilds = client.guilds.cache;
        
        //Si no hay guilds
        if (cachedGuilds.size === 0) {

            //Notifica que se debe volver a iniciar al bot
            console.warn(`${new Date().toLocaleString()} 》AVISO: Para continuar, debes volver a iniciar al bot.`);

            //Aborta el proceso de manera limpia
            process.exit();
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};

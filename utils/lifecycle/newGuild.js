exports.run = async (client, guild, locale) => {

    try {

        //Reestablece algunas variables de config. globales
        client.config.dynamic.homeGuild = guild.id;
        client.config.dynamic.inviteCode = "";

        //Carga de guild base en memoria
        client.homeGuild = await client.guilds.cache.get(client.config.dynamic.homeGuild);

        //Graba la nueva configuración en el almacenamiento
        await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
        
        //Almacena las traducciones de la función de carga del sistema
        const systemLoadLocale = await require(`../../resources/locales/${client.config.main.language}.json`).utils.lifecycle.systemLoad;

        //Carga la config. en memoria y arranca el sistema
        await require('./systemLoad.js').run(client, systemLoadLocale);

        //Informa sobre la necesidad de realizar la configuración inicial
        return await guild.members.fetch(guild.ownerId).then(async member => await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setTitle(`${client.customEmojis.greenTick} ${client.functions.localeParser(locale.title, { botUsername: client.user.username })}`)
            .setDescription(`${client.functions.localeParser(locale.description, { prefix: client.config.main.prefix, botUser: client.user })}.`)]
        }));

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR:`, error.stack);
    };
};

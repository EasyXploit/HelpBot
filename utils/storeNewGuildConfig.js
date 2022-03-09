exports.run = async (client, guild) => {

    //Carga de guild base en memoria
    client.config.main.homeGuild = guild.id;
    client.homeGuild = await client.guilds.cache.get(client.config.main.homeGuild);

    //Graba la nueva configuración en el almacenamiento
    await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), (err) => console.error(err));

    //Cargar config. en memoria + arranque del sistema completo
    await require('../utils/systemLoad.js').run(client);

    //Informar sobre el comando $setup
    const readyForSetup = new client.MessageEmbed()
        .setColor(client.config.colors.correct)
        .setTitle(`${client.customEmojis.greenTick} Asistente de configuración.`)
        .setDescription(`¡Genial! Has añadido correctamente a **${client.user.username}**.\nUsa el comando \`${client.config.main.prefix}setup\` desde __${guild.name}__ para configurar al bot.`);

    return await guild.owner.send({ embeds: [readyForSetup] });
};

exports.run = async (discord, client, guild) => {

    //Carga de guild base en memoria
    client.config.guild.homeGuild = guild.id;
    client.homeGuild = await client.guilds.cache.get(client.config.guild.homeGuild);

    //Graba la nueva configuración en el almacenamiento
    await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error(err));

    //Cargar config. en memoria + arranque del sistema completo
    await require('../utils/systemLoad.js').run(discord, client);

    //Informar sobre el comando $setup
    const readyForSetup = new discord.MessageEmbed()
        .setColor(client.config.colors.correct)
        .setTitle(`${client.customEmojis.greenTick} Asistente de configuración.`)
        .setDescription(`¡Genial! Has añadido correctamente a **${client.user.username}**.\nUsa el comando \`${client.config.guild.prefix}setup\` desde __${guild.name}__ para configurar al bot.`);

    return await guild.owner.send(readyForSetup);
};

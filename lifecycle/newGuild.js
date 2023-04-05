exports.run = async (client, guild) => {

    try {

        //Reestablece algunas variables de config. globales
        const baseGuild = await client.functions.db.setConfig.run('system.baseGuildId', guild.id);
        await client.functions.db.setConfig.run('system.inviteCode', '');

        //Carga de guild base en memoria
        client.baseGuild = await client.guilds.cache.get(baseGuild);
        
        //Carga la config. en memoria y arranca el sistema
        await require('./loadSystem.js').run(client, client.locale.lifecycle.loadSystem);

        //Informa sobre la necesidad de realizar la configuración inicial
        return await guild.members.fetch(guild.ownerId).then(async member => await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig.run('colors.correct')}`)
            .setTitle(`${client.customEmojis.greenTick} ${await client.functions.utilities.parseLocale.run(client.locale.lifecycle.newGuild.title, { botUsername: client.user.username })}`)
            .setDescription(`${await client.functions.utilities.parseLocale.run(client.locale.lifecycle.newGuild.description, { botUser: client.user })}.`)]
        }));

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};

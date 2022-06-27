exports.run = async (client, guild) => {

    try {

        //Reestablece algunas variables de config. globales
        client.config.dynamic.homeGuild = guild.id;
        client.config.dynamic.inviteCode = "";

        //Carga de guild base en memoria
        client.homeGuild = await client.guilds.cache.get(client.config.dynamic.homeGuild);

        //Graba la nueva configuración en el almacenamiento
        await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
        
        //Carga la config. en memoria y arranca el sistema
        await require('./loadSystem.js').run(client, client.locale.lifecycle.loadSystem);

        //Informa sobre la necesidad de realizar la configuración inicial
        return await guild.members.fetch(guild.ownerId).then(async member => await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setTitle(`${client.customEmojis.greenTick} ${await client.functions.utilities.parseLocale.run(client.locale.lifecycle.newGuild.title, { botUsername: client.user.username })}`)
            .setDescription(`${await client.functions.utilities.parseLocale.run(client.locale.lifecycle.newGuild.description, { botUser: client.user })}.`)]
        }));

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${client.locale.lifecycle.newGuild.error}:`, error.stack);
    };
};

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
        await require('../utils/systemLoad.js').run(client);

        //Informa sobre la necesidad de realizar la configuración inicial
        return await guild.members.fetch(guild.ownerId).then(async member => await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setTitle(`${client.customEmojis.greenTick} Asistente de configuración.`)
            .setDescription(`¡Genial! Has añadido correctamente a **${client.user.username}**.\nUsa los ficheros de configuración del bot para configurarlo a tu gusto.\nSi necesitas ayuda, puedes [consultar la wiki](https://github.com/EasyXploit/HelpBot/wiki/Configuration).`)]
        }));

    } catch (error) {
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};

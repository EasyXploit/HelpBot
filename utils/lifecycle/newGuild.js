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
        await require('./systemLoad.js').run(client);

        //Informa sobre la necesidad de realizar la configuración inicial
        return await guild.members.fetch(guild.ownerId).then(async member => await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setTitle(`${client.customEmojis.greenTick} ¡${client.user.username} añadido correctamente!`)
            .setDescription(`Usa los ficheros de configuración para ajustarlo al bot a tu gusto.\nUsa el comando \`${client.config.main.prefix}help\` para ver los comandos.\nRecuerda que el bot solo podrá moderar a aquellas personas que tengan un rol por debajo del rol creado por <@${client.user.id}>\nSi necesitas ayuda, puedes [consultar la wiki](https://github.com/EasyXploit/HelpBot/wiki/Configuration).`)]
        }));

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR:`, error.stack);
    };
};

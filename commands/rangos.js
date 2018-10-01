exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!rangos
    
    try {
        let experimentalEmbed = new discord.RichEmbed()
            .setColor(0xC6C9C6)
            .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
        await message.channel.send(experimentalEmbed);

        let helpEmbed = new discord.RichEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/IXN6UT2.png')
            .setAuthor('RANGOS', 'https://i.imgur.com/IXN6UT2.png')
            .setTitle('Rangos del servidor')
            .setDescription('**Recompensas por participación:** ' + emojis.beta + '\nLos usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:\n\n● Nivel **0**  ‣ **NOVATOS**: Es el primer rol que recibes al unirte a la comunidad.\n● Nivel **3**  ‣ **INICIADOS**: Permite usar emojis externos' + emojis.nitro + ' y acceder a sorteos públicos\n● Nivel **5**  ‣ **PROFESIONALES**: Permite adjuntar archivos.\n● Nivel **8**  ‣ **VETERANOS**: Permite publicar en <#472491041602404362>  y cambiar tu propio apodo.\n● Nivel **10**  ‣ **EXPERTOS**: Te permite mencionar a todos y controlar la música.\n● **SUPPORTERS**: Demuestra tu apoyo invitando a 5 personas (más info con el comando !comando).\n\nUsa `!rank` para conocer tu nivel, y `!levels` para ver la tabla de clasificación.\n\n```El sistema de recompensas se encuentra en desarrollo.\nPronto añadiremos más ventajas a aquellos que sean ascendidos.```\n\n► **RECUERDA ELEGIR TUS ROLES EN #🔖▸roles** ◄  _(deshabilitado temporalmente)_ Para ver los roles autoasignables, escrib el comando !comando')
            .setFooter('© 2018 República Gamer LLC', message.guild.iconURL);
        message.channel.send(helpEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

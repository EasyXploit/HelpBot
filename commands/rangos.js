exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed);
    
    const beta = bot.emojis.find('name', 'beta');
    const nitro = bot.emojis.find('name', 'nitro');
    

    let successEmbed = new discord.RichEmbed()
        .setAuthor('RANGOS', 'https://i.imgur.com/IXN6UT2.png')
        .setTitle('Rangos del servidor')

        .setColor(16762967)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('https://i.imgur.com/IXN6UT2.png')
        
        .setDescription('**Recompensas por participación:** ' + beta + '\nLos usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:\n\n● Nivel **0**  ‣ **NOVATOS**: Es el primer rol que recibes al unirte a la comunidad.\n● Nivel **3**  ‣ **INICIADOS**: Permite usar emojis externos' + nitro + ' y acceder a sorteos públicos\n● Nivel **5**  ‣ **PROFESIONALES**: Permite adjuntar archivos.\n● Nivel **8**  ‣ **VETERANOS**: Permite publicar en <#472491041602404362>  y cambiar tu propio apodo.\n● Nivel **10**  ‣ **EXPERTOS**: Te permite mencionar a todos y controlar la música.\n● **SUPPORTERS**: Demuestra tu apoyo invitando a 5 personas (más info con el comando !comando).\n\nUsa `!rank` para conocer tu nivel, y `!levels` para ver la tabla de clasificación.\n\n```El sistema de recompensas se encuentra en desarrollo.\nPronto añadiremos más ventajas a aquellos que sean ascendidos.```\n\n► **RECUERDA ELEGIR TUS ROLES EN #🔖▸roles** ◄  _(deshabilitado temporalmente)_ Para ver los roles autoasignables, escrib el comando !comando');
    message.channel.send(successEmbed);
}

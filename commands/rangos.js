exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!rangos
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/vDgiPwT.png')
            .setAuthor('NIVELES', 'https://i.imgur.com/vDgiPwT.png')
            .setDescription('Los usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:')
            .addField(`${resources.chevron} Lvl 0 ‣ PLATA I`, 'Es el primer rol que recibes al unirte a la comunidad.')
            .addField(`${resources.chevron5} Lvl 5 ‣ PLATA V`, `Permite usar emojis externos ${resources.nitro} y acceder a sorteos públicos.`)
            .addField(`${resources.chevron15} Lvl 10 ‣ ORO V`, 'Permite **adjuntar archivos** y **cambiar tu propio apodo**.')
            .addField(`${resources.chevron18} Lvl 15 ‣ PLATINO V`, 'Te permite **controlar la música**.')
            .addField('● Estadísticas', 'Usa `!rank` para conocer tu nivel\nUsa `!leaderboard` para ver la tabla de clasificación');
        
        await message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

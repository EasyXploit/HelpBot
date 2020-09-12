exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!rangos
    
    try {
        let helpEmbed1 = new discord.MessageEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/vDgiPwT.png')
            .setAuthor('NIVELES', 'https://i.imgur.com/vDgiPwT.png')
            .setDescription('Los usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:')
            .addField(`${resources.chevron} Nivel 0 ‣ PLATA I`, 'Es el primer rol que recibes al unirte a la comunidad.')
            .addField(`${resources.chevron5} Nivel 5 ‣ PLATA V`, `Permite usar emojis externos ${resources.nitro} y acceder a sorteos públicos.`)
            .addField(`${resources.chevron15} Nivel 10 ‣ ORO V`, 'Permite **adjuntar archivos** y **cambiar tu propio apodo**.')
            .addField(`${resources.chevron18} Nivel 15 ‣ PLATINO V`, 'Te permite **mencionar a todos** y **controlar la música**.')
            .addField('● Estadísticas', 'Usa `!rank` para conocer tu nivel\n[Ver la tabla de clasificación](https://mee6.xyz/leaderboard/374945492133740544)');
        
        let helpEmbed2 = new discord.MessageEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/TU8U8wq.png')
            .setAuthor('ROLES ASIGNABLES', 'https://i.imgur.com/TU8U8wq.png')
            .addField('● ¿Que son?', 'Los roles asignables te permiten añadir __tus propios roles__ basados en tus **intereses**, **videojuegos** y **región**.')
            .addField('● ¿Como los uso?', 'Desde el canal <#440905255073349635>, puedes reaccionar al mensaje de configuración con los emojis correspondientes a los roles que quieres asignarte')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, message.guild.iconURL());
        
        await message.channel.send(helpEmbed1);
        await message.channel.send(helpEmbed2);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}

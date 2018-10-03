exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!rangos
    
    try {
        let helpEmbed1 = new discord.RichEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/vDgiPwT.png')
            .setAuthor('RANGOS', 'https://i.imgur.com/vDgiPwT.png')
            .setDescription('Los usuarios que participan __activamente__ en la comunidad adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:')
            .addField(resources.chevron + ' Nivel 0 ‣ NOVATOS', 'Es el primer rol que recibes al unirte a la comunidad.', true)
            .addField(resources.chevron5 + ' Nivel 3 ‣ INICIADOS', 'Permite usar emojis externos' + resources.nitro + ' y acceder a sorteos públicos.', true)
            .addField(resources.chevron9 + ' Nivel 5 ‣ PROFESIONALES', 'Permite publicar en <#472491041602404362> y en <#488662764081119233>.', true)
            .addField(resources.chevron15 + ' Nivel 8 ‣ VETERANOS', 'Permite **adjuntar archivos** y **cambiar tu propio apodo**.', true)
            .addField(resources.chevron18 + ' Nivel 10 ‣ EXPERTOS', 'Te permite **mencionar a todos** y **controlar la música**.', true)
            .setFooter('Usa !rank para conocer tu nivel, y !levels para ver la tabla de clasificación.', resources.server.iconURL);
        
        let helpEmbed2 = new discord.RichEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/TU8U8wq.png')
            .setAuthor('ROLES ASIGNABLES (deshabilitado temporalmente)', 'https://i.imgur.com/TU8U8wq.png')
            .addField('● ¿Que son?', 'Los roles asignables te permiten añadir __tus propios roles__ basados en tus **intereses**, **videojuegos** y **región**.', true)
            .addField('● ¿Como los uso?', 'Desde el canal <#440905255073349635>, puedes reaccionar al mensaje de configuración con los emojis correspondientes a los roles que quieres asignarte', true)
            .setFooter('© 2018 República Gamer LLC', message.guild.iconURL);
        
        await message.channel.send(helpEmbed1);
        await message.channel.send(helpEmbed2);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}

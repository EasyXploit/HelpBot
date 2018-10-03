exports.run = async (discord, config, bot, message, args, command, e) => {
    
    //Se comprueba si el error es provocado por la invocación de un comando no existente
    if (e.toString().includes('Cannot find module')) return;
    
    //Se declara el canal de depuración
    const debuggingChannel = bot.channels.get(config.debuggingChannel);
    
    //Se declara el archivo de recursos
    const resources = require(`./resources/resources.js`);
    
    //Se comprueba si se han proporcionado argumentos
    let arguments;
    if (args.length < 1) {
        arguments = 'Ninguno';
    } else {
        arguments = args.join(' ');
    }
    
    //Se muestra el error en consola
    console.error('\n' + new Date().toUTCString() + ' 》' + e + '\n');

    //Se muestra el error en el canal de depuración
    let debuggEmbed = new discord.RichEmbed()
        .setColor(0xCBAC88)
        .setTimestamp()
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setTitle('📋 Depuración')
        .setDescription('Se declaró un error durante la ejecución de un comando')
        .addField('Comando:', command.slice(-0, -3), true)
        .addField('Argumentos:', arguments, true)
        .addField('Origen:', message.guild.name, true)
        .addField('Canal:', message.channel, true)
        .addField('Autor:', '<@' + message.author.id + '>', true)
        .addField('Fecha:', new Date().toUTCString(), true)
        .addField('Error:', e, true);
    
    let reportedEmbed = new discord.RichEmbed()
        .setColor(0xF04647)
        .setTitle(resources.RedTick + '¡Vaya! Algo fue mal ...')
        .setDescription('Lo hemos reportado al equipo de desarrollo');
    
    await message.channel.send(reportedEmbed);
    await debuggingChannel.send(debuggEmbed);
}
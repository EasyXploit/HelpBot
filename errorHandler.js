exports.run = async (discord, config, bot, message, args, command, e) => {
    
    //Se comprueba si el error es provocado por la invocación de un comando no existente
    if (e.toLocaleString().includes('Cannot find module') || e.toLocaleString().includes('Cannot send messages to this user')) return;

    //Se muestra el error en consola
    console.error('\n' + new Date().toLocaleString() + ' 》' + e.stack + '\n');
    
    //Se declara el canal de depuración
    const debuggingChannel = bot.channels.cache.get(config.debuggingChannel);
    
    //Se declara el archivo de recursos
    const resources = require(`./resources/resources.js`);
    
    //Se comprueba si se han proporcionado argumentos
    let arguments;
    if (args.length < 1) {
        arguments = 'Ninguno';
    } else {
        arguments = args.join(' ');
    }

    let error = e.stack;
    if (error.length > 1014) error = error.slice(0, 1014);
    error = error + ' ...';

    //Se muestra el error en el canal de depuración
    let debuggEmbed = new discord.MessageEmbed()
        .setColor(resources.brown)
        .setTitle('📋 Depuración')
        .setDescription('Se declaró un error durante la ejecución de un comando')
        .addField('Comando:', command.slice(-0, -3), true)
        .addField('Argumentos:', arguments, true)
        .addField('Origen:', message.guild.name, true)
        .addField('Canal:', message.channel, true)
        .addField('Autor:', '<@' + message.author.id + '>', true)
        .addField('Fecha:', new Date().toLocaleString(), true)
        .addField('Error:', `\`\`\`${error}\`\`\``, true)
        .setFooter(new Date().toLocaleString(), resources.server.iconURL()).setTimestamp()
    
    let reportedEmbed = new discord.MessageEmbed()
        .setColor(resources.red)
        .setTitle(`${resources.RedTick} ¡Vaya! Algo fue mal ...`)
        .setDescription('Lo hemos reportado al equipo de desarrollo');
    
    await message.channel.send(reportedEmbed);
    await debuggingChannel.send(debuggEmbed);
}
exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    let noCorrectSyntaxEmbed = new discord.RichEmbed()
        .setColor(0xF04647)
        .setDescription('❌ La sintaxis del comando es `' + config.staffPrefix + 'registra (#canal) (xS/xM/xH)`');

    if (args.length === 0 || args.length > 2) return message.channel.send(noCorrectSyntaxEmbed);
    if (!message.mentions.channels.first()) return message.channel.send(noCorrectSyntaxEmbed);

    let time = args.slice(1).join().slice(0, -1);
    let measure = args.slice(1).join().slice(-1).toLowerCase();
    
    if (measure !== 's' && measure !== 'm' && measure !== 'h') return message.channel.send('Error');
    
    let milliseconds;
    
    function stoms(seg) {
        milliseconds = seg * 1000
    }
    
    function mtoms(min) {
        milliseconds = min * 60000
    }
    
    function htoms(hour) {
        milliseconds = hour * 3600000
    } 
    
    switch (measure) {
        case 's':
            stoms(time);
            break;
        case 'm':
            mtoms(time);
            break;
        case 'h':
            htoms(time);
            break;
        default:
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ Ocurrió un error durante la ejecución del comando');
            return message.channel.send(errorEmbed);
            break;
    }

    let awaitingEmbed = new discord.RichEmbed()
        .setTitle('👁 Registrando mensajes ...')
        .setColor(0xFFC857)
        .setDescription(bot.user.username + ' registrará todos los mensajes enviados a ' + args[0] + ' durante ' + args[1] + '.')
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTimestamp();
    await message.channel.send(awaitingEmbed);

    console.log('\n 》' + bot.user.username + ' ha comenzado a registrar los mensajes del canal ' + message.mentions.channels.first().name + ' a petición de ' + message.author.username + ' durante ' + args[1] + '\n');

    const msgs = await message.mentions.channels.first().awaitMessages(msg => {return msg.content}, {time: milliseconds});

    let stopEmbed = new discord.RichEmbed()
        .setTitle('👁 Registro finalizado')
        .setColor(0xFFC857)
        .setDescription('Mensajes registrados por ' + bot.user.username + `:\n\n- ${msgs.map(msg => msg.content).join('\n- ')}`)
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTimestamp();
    message.channel.send(stopEmbed);

    console.log('\n 》' + bot.user.username + ' finalizó el registro de mensajes.');
}
